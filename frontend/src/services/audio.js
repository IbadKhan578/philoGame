// Web Audio API Procedural Sound Engine
// Generates soothing classical ambient tones, footsteps, dialogue chimes, and interaction sounds

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientInterval = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMute(mute) {
    this.isMuted = mute;
  }

  // Play a soft footstep rustle on grass/stone
  playFootstep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio glitches
    }
  }

  // Play a mystical, peaceful Greek lyre chime when discovering wisdom
  playWisdomChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Ancient pentatonic chord notes: E4, G4, A4, B4, D5, E5
      const notes = [329.63, 392.00, 440.00, 493.88, 587.33];

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.09, now + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 1.2);
      });
    } catch {
      // Ignore
    }
  }

  // Play a soft UI bubble pop / click sound
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  // Gentle ambient wind / garden chime loop
  startAmbient() {
    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;

    const playRandomChime = () => {
      if (!this.isAmbientPlaying) return;
      if (!this.isMuted && this.ctx && this.ctx.state === 'running') {
        const chord = [261.63, 329.63, 392.0, 523.25, 659.25];
        const freq = chord[Math.floor(Math.random() * chord.length)];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      }
      const nextDelay = 4000 + Math.random() * 5000;
      this.ambientTimeout = setTimeout(playRandomChime, nextDelay);
    };

    this.ambientTimeout = setTimeout(playRandomChime, 2000);
  }

  stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientTimeout) {
      clearTimeout(this.ambientTimeout);
      this.ambientTimeout = null;
    }
  }
}

export const soundManager = new SoundManager();
export default soundManager;
