/**
 * Audio Extractor Utility for SAIZUP AI
 * Extracts mono 12kHz PCM WAV audio directly from an uploaded video file (MP4, WebM, MOV)
 * in the user's browser using Web Audio API / OfflineAudioContext.
 */

export interface ExtractedAudioChunk {
  base64: string;
  mimeType: string;
  duration: number;
  offsetSeconds: number;
  sampleRate: number;
  hasAudio: boolean;
}

export type ExtractedAudioResult = Omit<ExtractedAudioChunk, 'offsetSeconds'>;

/**
 * Extracts the complete audio track in small WAV chunks so long clips stay
 * below the per-request AI payload limit and receive accurate time offsets.
 */
export async function extractAudioChunksFromVideoFile(
  videoFile: File,
  chunkDurationSeconds = 30,
  maxDurationSeconds = Number.POSITIVE_INFINITY,
  onProgress?: (completedChunks: number, totalChunks: number) => void
): Promise<ExtractedAudioChunk[]> {
  try {
    // 1. Read file as ArrayBuffer
    const arrayBuffer = await videoFile.arrayBuffer();

    // 2. Decode audio with AudioContext
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('ບຣາວເຊີນີ້ບໍ່ຮອງຮັບການອ່ານສຽງຈາກໄຟລ໌');
    }

    const audioCtx = new AudioCtx();
    let decodedAudio: AudioBuffer;

    try {
      decodedAudio = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      throw new Error('ອ່ານແທຣັກສຽງຈາກວິດີໂອບໍ່ໄດ້ ກະລຸນາໃຊ້ MP4 ຫຼື WAV');
    } finally {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    }

    const duration = Math.min(decodedAudio.duration, maxDurationSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('ບໍ່ພົບສຽງໃນໄຟລ໌ວິດີໂອ');
    }

    const targetSampleRate = 12000;
    const chunks: ExtractedAudioChunk[] = [];
    const totalChunks = Math.ceil(duration / chunkDurationSeconds);
    onProgress?.(0, totalChunks);
    for (let offsetSeconds = 0; offsetSeconds < duration; offsetSeconds += chunkDurationSeconds) {
      const chunkDuration = Math.min(chunkDurationSeconds, duration - offsetSeconds);
      const numSamples = Math.ceil(targetSampleRate * chunkDuration);
      const offlineCtx = new OfflineAudioContext(1, numSamples, targetSampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(offlineCtx.destination);
      source.start(0, offsetSeconds, chunkDuration);

      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);
      let maxAmplitude = 0;
      for (let i = 0; i < channelData.length; i += 100) {
        maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]));
      }

      chunks.push({
        base64: arrayBufferToBase64(encodePCM16Wav(channelData, targetSampleRate)),
        mimeType: 'audio/wav',
        duration: chunkDuration,
        offsetSeconds,
        sampleRate: targetSampleRate,
        hasAudio: maxAmplitude > 0.005,
      });
      onProgress?.(chunks.length, totalChunks);
    }

    if (!chunks.some((chunk) => chunk.hasAudio)) {
      throw new Error('ວິດີໂອນີ້ບໍ່ມີສຽງ ຫຼື ສຽງເບົາເກີນໄປ');
    }

    return chunks;
  } catch (err) {
    console.warn('Audio extraction failed:', err);
    throw err instanceof Error ? err : new Error('ສະກັດສຽງຈາກວິດີໂອບໍ່ສຳເລັດ');
  }
}

/** Backwards-compatible short-clip extractor used by the video editor. */
export async function extractAudioFromVideoFile(
  videoFile: File,
  maxDurationSeconds = 60
): Promise<ExtractedAudioResult> {
  const [firstChunk] = await extractAudioChunksFromVideoFile(
    videoFile,
    maxDurationSeconds,
    maxDurationSeconds
  );
  if (!firstChunk) throw new Error('ບໍ່ພົບສຽງໃນໄຟລ໌ວິດີໂອ');
  return {
    base64: firstChunk.base64,
    mimeType: firstChunk.mimeType,
    duration: firstChunk.duration,
    sampleRate: firstChunk.sampleRate,
    hasAudio: firstChunk.hasAudio,
  };
}

/**
 * Encode Float32Array PCM samples into standard 16-bit Mono PCM WAV
 */
function encodePCM16Wav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM = 1) */
  view.setUint16(20, 1, true);
  /* channel count (1 = mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sampleRate * 1 channel * 2 bytes/sample) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (1 channel * 2 bytes/sample) */
  view.setUint16(32, 2, true);
  /* bits per sample (16) */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (float32 [-1.0, 1.0] -> int16 [-32768, 32767])
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

/**
 * Safe conversion of ArrayBuffer to Base64 without call stack overflow
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }

  return btoa(binary);
}
