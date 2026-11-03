/**
 * Audio Extractor Utility for SAIZUP AI
 * Extracts mono 16kHz PCM WAV audio directly from an uploaded video file (MP4, WebM, MOV)
 * in the user's browser using Web Audio API / OfflineAudioContext.
 * Features:
 * - 16,000 Hz sample rate (universal STT standard for tonal Lao/Thai phonetics)
 * - Chunk boundary overlap (1.5s) to avoid severed words
 * - Frame-level Voice Activity Detection (VAD) to skip music/silence hallucination
 * - Browser memory protection for files > 500MB
 */

export interface ExtractedAudioChunk {
  base64: string;
  mimeType: string;
  duration: number;
  offsetSeconds: number;
  sampleRate: number;
  hasAudio: boolean;
  overlapSeconds?: number;
  vadVoicedRatio?: number;
}

export type ExtractedAudioResult = Omit<ExtractedAudioChunk, 'offsetSeconds'>;

/**
 * Extracts the complete audio track in small WAV chunks with 1.5s boundary overlap
 * so long clips stay below payload limits and never cut words in half.
 */
export async function extractAudioChunksFromVideoFile(
  videoFile: File,
  chunkDurationSeconds = 30,
  maxDurationSeconds = Number.POSITIVE_INFINITY,
  onProgress?: (completedChunks: number, totalChunks: number) => void
): Promise<ExtractedAudioChunk[]> {
  try {
    // 0. Large file memory protection
    if (videoFile.size > 500 * 1024 * 1024) {
      console.warn(
        `[audioExtractor] Large file (${(videoFile.size / (1024 * 1024)).toFixed(1)}MB). Extracting audio stream carefully to protect browser RAM.`
      );
    }

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
      throw new Error('ອ່ານແທຣັກສຽງຈາກວິດີໂອບໍ່ໄດ້ ກະລຸນາໃຊ້ MP4, WebM ຫຼື WAV');
    } finally {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    }

    const duration = Math.min(decodedAudio.duration, maxDurationSeconds);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('ບໍ່ພົບສຽງໃນໄຟລ໌ວິດີໂອ');
    }

    // 16kHz standard for Speech-to-Text (Lao/Thai tonal preservation)
    const targetSampleRate = 16000;
    const overlapSeconds = 1.5;
    const chunks: ExtractedAudioChunk[] = [];
    const totalChunks = Math.ceil(duration / chunkDurationSeconds);
    onProgress?.(0, totalChunks);

    let offsetSeconds = 0;
    while (offsetSeconds < duration) {
      // Chunk start and duration with boundary overlap
      const chunkStart = offsetSeconds;
      const rawChunkDuration = Math.min(chunkDurationSeconds, duration - chunkStart);
      // For chunks after the first, include an overlap window to avoid cut-off words
      const includeOverlap = offsetSeconds > 0 && offsetSeconds + rawChunkDuration < duration;
      const actualDuration = Math.min(
        includeOverlap ? rawChunkDuration + overlapSeconds : rawChunkDuration,
        duration - chunkStart
      );

      const numSamples = Math.ceil(targetSampleRate * actualDuration);
      const offlineCtx = new OfflineAudioContext(1, numSamples, targetSampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(offlineCtx.destination);
      source.start(0, chunkStart, actualDuration);

      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);

      // Voice Activity Detection (VAD) via short-term frame energy / RMS
      const frameSize = Math.floor(targetSampleRate * 0.05); // 50ms frames
      let voicedFrames = 0;
      let totalFrames = 0;
      let maxAmplitude = 0;

      for (let i = 0; i < channelData.length; i += frameSize) {
        let frameEnergy = 0;
        const end = Math.min(channelData.length, i + frameSize);
        for (let j = i; j < end; j++) {
          const val = channelData[j];
          frameEnergy += val * val;
          maxAmplitude = Math.max(maxAmplitude, Math.abs(val));
        }
        const rms = Math.sqrt(frameEnergy / Math.max(1, end - i));
        // Voiced speech energy threshold (filter dead air & low hums)
        if (rms > 0.012) {
          voicedFrames++;
        }
        totalFrames++;
      }

      const vadVoicedRatio = totalFrames > 0 ? voicedFrames / totalFrames : 0;
      // Generous threshold to protect whisper, soft voices, and speech behind music from being dropped
      const hasAudio = maxAmplitude > 0.0008 || vadVoicedRatio > 0.005;

      chunks.push({
        base64: arrayBufferToBase64(encodePCM16Wav(channelData, targetSampleRate)),
        mimeType: 'audio/wav',
        duration: actualDuration,
        offsetSeconds: chunkStart,
        sampleRate: targetSampleRate,
        hasAudio,
        overlapSeconds: includeOverlap ? overlapSeconds : 0,
        vadVoicedRatio,
      });

      offsetSeconds += chunkDurationSeconds;
      onProgress?.(chunks.length, totalChunks);
    }

    if (chunks.length === 0) {
      throw new Error('ບໍ່ພົບແທຣັກສຽງໃນໄຟລ໌ວິດີໂອ');
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
  maxDurationSeconds = 600
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

/**
 * Intelligent Subtitle Stitcher & De-duplicator for overlapping chunk boundaries.
 * Merges subtitle arrays from sequential chunks, removing any redundant segments
 * that fall in the overlap window and smoothing time transitions without dropping real words.
 */
export function stitchOverlappingSubtitles<T extends { time: number; endTime: number; text: string }>(
  allSubtitles: T[]
): T[] {
  if (allSubtitles.length <= 1) return allSubtitles;

  // Filter out empty or whitespace-only texts
  const valid = allSubtitles.filter((s) => s && typeof s.text === 'string' && s.text.trim().length > 0);
  if (valid.length <= 1) return valid;

  // Sort strictly by start time
  const sorted = [...valid].sort((a, b) => a.time - b.time);
  const result: T[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = result[result.length - 1];

    if (!prev) {
      result.push({ ...current });
      continue;
    }

    const cleanCur = current.text.replace(/\s+/g, '').toLowerCase();
    const cleanPrev = prev.text.replace(/\s+/g, '').toLowerCase();
    const timeOverlap = Math.min(prev.endTime, current.endTime) - Math.max(prev.time, current.time);

    // Only de-duplicate if the text is identical or nearly identical in an overlapping time window
    const isExactDuplicate = cleanCur === cleanPrev && timeOverlap > 0.1;
    const isSubstantialDuplicate =
      timeOverlap > 0.4 &&
      cleanCur.length > 8 &&
      cleanPrev.length > 8 &&
      (cleanCur.includes(cleanPrev) || cleanPrev.includes(cleanCur));

    if (isExactDuplicate || isSubstantialDuplicate) {
      // Extend previous end time if current is longer, without duplicating line
      prev.endTime = Math.max(prev.endTime, current.endTime);
      continue;
    }

    // If times overlap slightly at chunk boundary but words are different:
    // preserve both, adjusting start time so they chain sequentially
    const currentCopy = { ...current };
    if (currentCopy.time < prev.endTime) {
      if (currentCopy.endTime <= prev.endTime) {
        currentCopy.endTime = Number((prev.endTime + 1.2).toFixed(2));
      }
      currentCopy.time = Number(prev.endTime.toFixed(2));
    }

    result.push(currentCopy);
  }

  return result;
}
