// Essential Sound Effects Library for SAIZUP AI Studio
// Uses Web Audio API synthesis for zero-latency, 100% reliable sound playback

export interface SoundEffectItem {
  id: string;
  name: string;
  nameLao: string;
  category: 'transition' | 'impact' | 'funny' | 'ui' | 'foley';
  icon: string;
  durationSec: number;
}

export const ESSENTIAL_SOUND_EFFECTS: SoundEffectItem[] = [
  {
    id: 'sfx_whoosh',
    name: 'Fast Whoosh',
    nameLao: 'ສຽງຊວ້າວ (Whoosh)',
    category: 'transition',
    icon: '💨',
    durationSec: 0.45,
  },
  {
    id: 'sfx_pop',
    name: 'Bubble Pop',
    nameLao: 'ສຽງປ໊ອບ (Pop)',
    category: 'ui',
    icon: '🫧',
    durationSec: 0.18,
  },
  {
    id: 'sfx_ding',
    name: 'Success Ding',
    nameLao: 'ສຽງດິ້ງ (Ding / Bell)',
    category: 'ui',
    icon: '🔔',
    durationSec: 0.8,
  },
  {
    id: 'sfx_camera',
    name: 'Camera Shutter',
    nameLao: 'ສຽງກ້ອງຖ່າຍຮູບ (Camera)',
    category: 'foley',
    icon: '📸',
    durationSec: 0.35,
  },
  {
    id: 'sfx_scratch',
    name: 'Vinyl Scratch',
    nameLao: 'ສຽງແຜ່ນສຽງຂູດ (Scratch)',
    category: 'funny',
    icon: '💿',
    durationSec: 0.6,
  },
  {
    id: 'sfx_glitch',
    name: 'Cyber Glitch',
    nameLao: 'ສຽງກະລິສ (Glitch)',
    category: 'transition',
    icon: '⚡',
    durationSec: 0.4,
  },
  {
    id: 'sfx_boom',
    name: 'Impact Boom',
    nameLao: 'ສຽງບູມ (Impact Boom)',
    category: 'impact',
    icon: '💥',
    durationSec: 1.2,
  },
  {
    id: 'sfx_click',
    name: 'Mouse Click',
    nameLao: 'ສຽງຄລິກ (Click)',
    category: 'ui',
    icon: '🖱️',
    durationSec: 0.08,
  },
  {
    id: 'sfx_horn',
    name: 'Air Horn / Hype',
    nameLao: 'ສຽງແກຮາວ (Air Horn)',
    category: 'funny',
    icon: '🎺',
    durationSec: 0.9,
  },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export interface SoundEffectMixDestination {
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
}

export function createSoundEffectMixDestination(): SoundEffectMixDestination | null {
  const context = getAudioContext();
  if (!context) return null;
  return { context, destination: context.createMediaStreamDestination() };
}

/**
 * Synthesizes and plays essential sound effects using Web Audio API
 */
export function playSoundEffect(effectId: string, volume: number = 0.8, output?: AudioNode) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(output || ctx.destination);

  switch (effectId) {
    case 'sfx_whoosh': {
      // Noise buffer filtered with sweeping bandpass
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.45);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.18);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(now);
      noise.stop(now + 0.45);
      break;
    }

    case 'sfx_pop': {
      // High sine chirp that drops fast
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
      break;
    }

    case 'sfx_ding': {
      // Crisp bell overtone
      const freqs = [1046.5, 2093.0, 3135.9]; // C6 and harmonics
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = 0.5 / (idx + 1);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.8);
      });
      break;
    }

    case 'sfx_camera': {
      // Mechanical snap click + whirr
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(800, now);
      snap.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      snapGain.gain.setValueAtTime(0.8, now);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      snap.connect(snapGain);
      snapGain.connect(masterGain);
      snap.start(now);
      snap.stop(now + 0.09);

      // Secondary click after 70ms
      setTimeout(() => {
        const ctx2 = getAudioContext();
        if (!ctx2) return;
        const now2 = ctx2.currentTime;
        const click = ctx2.createOscillator();
        const clickGain = ctx2.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(1200, now2);
        click.frequency.exponentialRampToValueAtTime(100, now2 + 0.06);
        clickGain.gain.setValueAtTime(0.6, now2);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now2 + 0.07);
        click.connect(clickGain);
        clickGain.connect(ctx2.destination);
        click.start(now2);
        click.stop(now2 + 0.07);
      }, 70);
      break;
    }

    case 'sfx_scratch': {
      // Fast pitch oscillating saw
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.15);
      osc.frequency.linearRampToValueAtTime(250, now + 0.35);
      osc.frequency.linearRampToValueAtTime(80, now + 0.55);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.58);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
      break;
    }

    case 'sfx_boom': {
      // Low sub-bass drop with punch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.8);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.2);
      break;
    }

    case 'sfx_click': {
      // Subtle tactile click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }

    case 'sfx_glitch': {
      // Rapid stepped frequencies
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      [400, 1200, 600, 2400, 300, 1800].forEach((f, idx) => {
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
      });
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
      break;
    }

    case 'sfx_horn': {
      // Brass air horn chords (Eb and Bb)
      const freqs = [311.13, 466.16, 622.25];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.75);
      });
      break;
    }

    default:
      break;
  }
}
