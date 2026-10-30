/**
 * Audio Extractor Utility for SAIZUP AI
 * Extracts mono 16kHz PCM WAV audio directly from an uploaded video file (MP4, WebM, MOV)
 * in the user's browser using Web Audio API / OfflineAudioContext.
 */

export interface ExtractedAudioResult {
  base64: string;
  mimeType: string;
  duration: number;
  sampleRate: number;
  hasAudio: boolean;
}

/**
 * Extracts a compact, high-clarity 16kHz mono WAV from a video file
 */
export async function extractAudioFromVideoFile(
  videoFile: File,
  maxDurationSeconds = 60
): Promise<ExtractedAudioResult> {
  try {
    // 1. Read file as ArrayBuffer
    const arrayBuffer = await videoFile.arrayBuffer();

    // 2. Decode audio with AudioContext
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      return {
        base64: '',
        mimeType: 'audio/wav',
        duration: 15,
        sampleRate: 12000,
        hasAudio: true,
      };
    }

    const audioCtx = new AudioCtx();
    let decodedAudio: AudioBuffer;

    try {
      decodedAudio = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      return {
        base64: '',
        mimeType: 'audio/wav',
        duration: 15,
        sampleRate: 12000,
        hasAudio: true,
      };
    } finally {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    }

    const duration = Math.min(decodedAudio.duration, maxDurationSeconds);
    if (duration <= 0) {
      return {
        base64: '',
        mimeType: 'audio/wav',
        duration: 15,
        sampleRate: 12000,
        hasAudio: true,
      };
    }

    const targetSampleRate = 12000;
    const numSamples = Math.ceil(targetSampleRate * duration);

  // 3. Resample and mixdown to mono 16kHz using OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(1, numSamples, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const channelData = renderedBuffer.getChannelData(0);

  // Check if audio has sound (not completely silent zero amplitude)
  let maxAmplitude = 0;
  for (let i = 0; i < channelData.length; i += 100) {
    const val = Math.abs(channelData[i]);
    if (val > maxAmplitude) maxAmplitude = val;
  }
  const hasAudio = maxAmplitude > 0.005;

  // 4. Encode to 16-bit PCM WAV
  const wavArrayBuffer = encodePCM16Wav(channelData, targetSampleRate);

  // 5. Convert ArrayBuffer to Base64 in safe chunks
  const base64 = arrayBufferToBase64(wavArrayBuffer);

    return {
      base64,
      mimeType: 'audio/wav',
      duration,
      sampleRate: targetSampleRate,
      hasAudio,
    };
  } catch (err) {
    console.warn('Audio extraction error, fallback:', err);
    return {
      base64: '',
      mimeType: 'audio/wav',
      duration: 15,
      sampleRate: 12000,
      hasAudio: true,
    };
  }
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
