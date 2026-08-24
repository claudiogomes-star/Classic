// Sistema de Áudio e Voz Arcade Procedural com Web Audio API

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmInterval = null;
    this.tempo = 135;
    
    // Suporte a sintetizador de voz para announcer
    this.speechSynth = window.speechSynthesis || null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio não suportado ou bloqueado:", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
    }
    return this.isMuted;
  }

  // --- ANUNCIADOR DE VOZ CLÁSSICO METAL SLUG ---
  announce(text) {
    if (this.isMuted) return;
    try {
      if (this.speechSynth) {
        this.speechSynth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.15;
        utter.pitch = 0.75; // Voz mais grave, enérgica e militar
        utter.volume = 1.0;
        
        // Tentar selecionar voz masculina em inglês se disponível
        const voices = this.speechSynth.getVoices();
        const deepVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Google US English')));
        if (deepVoice) utter.voice = deepVoice;
        
        this.speechSynth.speak(utter);
      }
    } catch (e) {
      console.log("Announce error:", e);
    }
    
    // Som secundário de sintetizador militar arcade
    this.playAnnounceJingle();
  }

  playAnnounceJingle() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- EFEITOS SONOROS DE TIRO E COMBATE ---

  playShootPistol() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);

    this.playNoise(0.05, 0.2, 1200);
  }

  playShootHMG() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);

    this.playNoise(0.06, 0.35, 800);
  }

  playShootShotgun() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);

    this.playNoise(0.22, 0.6, 600);
  }

  playShootRocket() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);

    this.playNoise(0.25, 0.4, 1500, 'bandpass');
  }

  playShootFlame() {
    if (!this.ctx || this.isMuted) return;
    this.playNoise(0.12, 0.3, 400, 'lowpass');
  }

  playShootLaser() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playMeleeSlash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playAxeSwing() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);

    this.playNoise(0.18, 0.5, 900, 'bandpass');
  }

  playAxeHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);

    this.playNoise(0.15, 0.7, 1800, 'highpass');
  }

  playBowShot() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);

    this.playNoise(0.08, 0.4, 3000, 'highpass');
  }

  playArrowHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);

    this.playNoise(0.06, 0.6, 2200, 'bandpass');
  }

  playBowSpecial() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1000 + i * 300, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    }
    this.playNoise(0.25, 0.6, 1500, 'highpass');
  }

  playPitFall() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playMechaRoar() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Rugido Metálico de Kaiju com Modulação de Frequência e Ruído Distorcido
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.08;

      osc.type = i === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(280 - i * 50, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.7);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.7);
    }
    this.playNoise(0.65, 0.8, 400, 'lowpass');
    this.playNoise(0.4, 0.5, 1200, 'bandpass');
  }

  playProtonBeam() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Carga inicial do feixe
    const oscCharge = this.ctx.createOscillator();
    const gainCharge = this.ctx.createGain();
    oscCharge.type = 'sine';
    oscCharge.frequency.setValueAtTime(300, now);
    oscCharge.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
    gainCharge.gain.setValueAtTime(0.4, now);
    gainCharge.gain.linearRampToValueAtTime(0.01, now + 0.25);
    oscCharge.connect(gainCharge);
    gainCharge.connect(this.sfxGain);
    oscCharge.start(now);
    oscCharge.stop(now + 0.25);

    // Disparo contínuo do Laser Vermelho Atômico
    const oscBeam = this.ctx.createOscillator();
    const gainBeam = this.ctx.createGain();
    oscBeam.type = 'sawtooth';
    oscBeam.frequency.setValueAtTime(440, now + 0.2);
    oscBeam.frequency.linearRampToValueAtTime(320, now + 1.2);
    gainBeam.gain.setValueAtTime(0.7, now + 0.2);
    gainBeam.gain.linearRampToValueAtTime(0.01, now + 1.2);
    oscBeam.connect(gainBeam);
    gainBeam.connect(this.sfxGain);
    oscBeam.start(now + 0.2);
    oscBeam.stop(now + 1.2);

    this.playNoise(0.9, 0.7, 1800, 'bandpass');
  }

  playMechaStep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Impacto sísmico grave de pata mecânica gigante
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.18);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // Ruído de atrito mecânico e poeira
    this.playNoise(0.12, 0.35, 300, 'lowpass');
  }

  playLaserCharge() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Tom agudo ascendente de conversão de energia quântica
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.55);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.45);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.55);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  playExplosion(heavy = false) {
    if (!this.ctx || this.isMuted) return;
    const dur = heavy ? 0.6 : 0.35;
    const vol = heavy ? 0.7 : 0.45;
    this.playNoise(dur, vol, heavy ? 250 : 450, 'lowpass');

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + dur);

    gain.gain.setValueAtTime(vol * 0.8, now);
    gain.gain.linearRampToValueAtTime(0.01, now + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  playJump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playItemPickup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.18); // C6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSlugCannon() {
    if (!this.ctx || this.isMuted) return;
    this.playExplosion(true);
  }

  playSlugEnter() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playBossWarning() {
    if (!this.ctx || this.isMuted) return;
    let count = 0;
    const playSiren = () => {
      if (count >= 3 || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.25);
      osc.frequency.linearRampToValueAtTime(400, now + 0.5);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.5);

      count++;
      setTimeout(playSiren, 520);
    };
    playSiren();
  }

  playMissionComplete() {
    if (!this.ctx || this.isMuted) return;
    const notes = [440, 440, 440, 554.37, 659.25, 554.37, 659.25, 880];
    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 0.95, 1.2];
    const base = this.ctx.currentTime;

    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = base + times[idx];

      osc.type = 'sawtooth';
      osc.frequency.value = f;

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + (idx === 7 ? 0.8 : 0.14));

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + (idx === 7 ? 0.8 : 0.14));
    });
  }

  // Helper de Ruído Branco / Explosão
  playNoise(duration, volume, cutoff = 1000, filterType = 'lowpass') {
    if (!this.ctx || this.isMuted) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // --- TRILHA SONORA DINÂMICA PROCEDURAL (ARCADE ACTION BGM) ---
  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;

    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const leadNotes = [220, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63];

    const stepDuration = 60 / (this.tempo * 2); // semicolcheias

    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || !this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Bassline forte e ritmado
      const bFreq = bassNotes[this.bgmStep % bassNotes.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bFreq, now);

      bassGain.gain.setValueAtTime(0.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.9);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + stepDuration * 0.9);

      // Kick & Snare rítmico
      if (this.bgmStep % 4 === 0) {
        // Kick Drum
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      } else if (this.bgmStep % 4 === 2) {
        // Snare
        this.playNoise(0.08, 0.15, 1200, 'bandpass');
      }

      // Melodia Arcade
      if (this.bgmStep % 2 === 0) {
        const lFreq = leadNotes[(Math.floor(this.bgmStep / 2)) % leadNotes.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(lFreq, now);

        leadGain.gain.setValueAtTime(0.09, now);
        leadGain.gain.exponentialRampToValueAtTime(0.005, now + stepDuration * 1.5);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 1.5);
      }

      this.bgmStep++;
    }, stepDuration * 1000);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// Instância global de áudio
const audio = new SoundSystem();
