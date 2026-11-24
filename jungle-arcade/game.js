/**
 * ============================================================================
 * AMAZON JUNGLE ARCADE // 3-IN-1 HIGH-FIDELITY NATURE SANCTUARY
 * Developer: Harish Pranav S (hyprpranav)
 * Tech: Pure HTML5 Canvas 2D Engine • Procedural Web Audio Nature Synthesizer
 * Zero External Dependencies • 100% Mobile & Desktop Responsive
 * ============================================================================
 */

(function () {
  'use strict';

  // --- PROCEDURAL NATURE AMBIENCE & SOUND ENGINE (Web Audio API) ---
  class NatureAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.riverGain = null;
      this.cricketTimer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.startPeacefulAmbience();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    startPeacefulAmbience() {
      if (!this.ctx || !this.enabled) return;

      try {
        // Continuous Gentle Flowing Amazon River (Dual-filtered white noise)
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const riverFilter = this.ctx.createBiquadFilter();
        riverFilter.type = 'bandpass';
        riverFilter.frequency.setValueAtTime(360, this.ctx.currentTime);
        riverFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

        const riverGain = this.ctx.createGain();
        riverGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

        whiteNoise.connect(riverFilter);
        riverFilter.connect(riverGain);
        riverGain.connect(this.ctx.destination);
        whiteNoise.start();
        this.riverGain = riverGain;

        // Periodic Nocturnal Rainforest Crickets
        this.scheduleCricketChirp();
      } catch (e) {}
    }

    scheduleCricketChirp() {
      if (!this.enabled || !this.ctx) return;
      const nextChirp = 2500 + Math.random() * 3500;
      this.cricketTimer = setTimeout(() => {
        this.playCricketSound();
        this.scheduleCricketChirp();
      }, nextChirp);
    }

    playCricketSound() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(4850, this.ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(4500, this.ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch (e) {}
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.riverGain) {
        this.riverGain.gain.setValueAtTime(this.enabled ? 0.06 : 0, this.ctx.currentTime);
      }
      return this.enabled;
    }

    playEatChime() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.14); // A5
        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
      } catch (e) {}
    }

    playSplash() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
      } catch (e) {}
    }

    playGameOverSound() {
      if (!this.enabled || !this.ctx) return;
      try {
        const notes = [349.23, 293.66, 220.0];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.14);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.14);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.14 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.14);
          osc.stop(this.ctx.currentTime + i * 0.14 + 0.2);
        });
      } catch (e) {}
    }
  }

  // --- CANVAS SETUP ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const audio = new NatureAudioEngine();

  // DOM Elements
  const scoreDisplay = document.getElementById('score-display');
  const hiScoreDisplay = document.getElementById('hi-score-display');
  const menuOverlay = document.getElementById('menu-overlay');
  const pauseOverlay = document.getElementById('pause-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const finalScoreEl = document.getElementById('final-score');
  const finalHiScoreEl = document.getElementById('final-hiscore');
  const newHiBanner = document.getElementById('new-high-score-banner');
  const natureSoundBtn = document.getElementById('nature-sound-btn');
  const menuGameTitle = document.getElementById('menu-game-title');
  const menuGameDesc = document.getElementById('menu-game-desc');
  const instDesktop = document.getElementById('inst-desktop');

  let activeGame = 'snake';
  let state = 'MENU';
  let score = 0;
  let hiScores = {
    snake: parseInt(localStorage.getItem('jungle_hiscore_snake') || '0', 10),
    river: parseInt(localStorage.getItem('jungle_hiscore_river') || '0', 10),
    canopy: parseInt(localStorage.getItem('jungle_hiscore_canopy') || '0', 10)
  };
  updateHiScoreDisplay();

  let width = 0;
  let height = 0;
  let floatingTexts = [];
  let shockwaves = [];
  let ambientFireflies = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width;
    canvas.height = height;
    initAmbientFireflies();
  }
  window.addEventListener('resize', resize);
  resize();

  function initAmbientFireflies() {
    ambientFireflies = [];
    for (let i = 0; i < 16; i++) {
      ambientFireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 1.5 + Math.random() * 2,
        color: Math.random() > 0.4 ? '#facc15' : '#00f59b'
      });
    }
  }

  function addFloatingText(text, x, y, color = '#00f59b') {
    floatingTexts.push({ text, x, y, vy: -1.2, alpha: 1.0, color });
  }

  function addShockwave(x, y, color = '#00f59b') {
    shockwaves.push({ x, y, r: 4, maxR: 45, alpha: 1.0, color });
  }

  function updateHiScoreDisplay() {
    hiScoreDisplay.textContent = String(hiScores[activeGame] || 0).padStart(5, '0');
  }

  // ==========================================================================
  // 1. GAME 1: AMAZON ANACONDA (HIGH-FIDELITY SNAKE)
  // ==========================================================================
  const snakeGame = {
    gridSize: 22,
    cols: 0,
    rows: 0,
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    stepTimer: 0,
    stepSpeed: 0.11,
    tongueTimer: 0,

    init() {
      this.cols = Math.floor(width / this.gridSize);
      this.rows = Math.floor(height / this.gridSize);
      const startX = Math.floor(this.cols / 2);
      const startY = Math.floor(this.rows / 2);
      this.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
        { x: startX - 3, y: startY }
      ];
      this.dir = { x: 1, y: 0 };
      this.nextDir = { x: 1, y: 0 };
      this.stepTimer = 0;
      this.stepSpeed = 0.11;
      this.spawnFood();
    },

    spawnFood() {
      let valid = false;
      while (!valid) {
        this.food = {
          x: 2 + Math.floor(Math.random() * (this.cols - 4)),
          y: 2 + Math.floor(Math.random() * (this.rows - 4))
        };
        valid = !this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
      }
    },

    update(dt) {
      this.stepTimer += dt;
      if (this.stepTimer < this.stepSpeed) return;
      this.stepTimer = 0;

      this.dir = { ...this.nextDir };
      const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

      // Wall collision
      if (head.x < 1 || head.x >= this.cols - 1 || head.y < 1 || head.y >= this.rows - 1) {
        gameOver();
        return;
      }

      // Self collision
      if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
      }

      this.snake.unshift(head);

      // Eat firefly
      if (head.x === this.food.x && head.y === this.food.y) {
        audio.playEatChime();
        score += 100;
        scoreDisplay.textContent = String(score).padStart(5, '0');
        const fx = this.food.x * this.gridSize + this.gridSize / 2;
        const fy = this.food.y * this.gridSize + this.gridSize / 2;
        addFloatingText('+100', fx, fy, '#facc15');
        addShockwave(fx, fy, '#00f59b');

        this.stepSpeed = Math.max(0.065, this.stepSpeed - 0.001);
        this.spawnFood();
      } else {
        this.snake.pop();
      }
    },

    draw(ctx) {
      // Rainforest Floor with Stone Border
      ctx.fillStyle = '#020d06';
      ctx.fillRect(0, 0, width, height);

      // Ancient Mossy Stone Border
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = this.gridSize;
      ctx.strokeRect(this.gridSize / 2, this.gridSize / 2, width - this.gridSize, height - this.gridSize);

      // Border Vine Flourishes
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.gridSize, this.gridSize, width - this.gridSize * 2, height - this.gridSize * 2);

      // Draw Glowing Firefly with Fluttering Wings
      const fx = this.food.x * this.gridSize + this.gridSize / 2;
      const fy = this.food.y * this.gridSize + this.gridSize / 2;

      ctx.save();
      // Pulsing aura
      const aura = 10 + Math.sin(Date.now() / 150) * 4;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = aura;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(fx, fy, this.gridSize * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Firefly Translucent Wings
      const wingFlutter = Math.sin(Date.now() / 60) * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(fx - 4, fy - 6, 5, 2 + Math.abs(wingFlutter) * 0.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(fx + 4, fy - 6, 5, 2 + Math.abs(wingFlutter) * 0.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Anaconda Body Segments
      this.snake.forEach((seg, i) => {
        const cx = seg.x * this.gridSize + this.gridSize / 2;
        const cy = seg.y * this.gridSize + this.gridSize / 2;
        const radius = (this.gridSize / 2) * (1 - (i / this.snake.length) * 0.35);

        ctx.save();
        if (i === 0) {
          // Head
          ctx.shadowColor = '#00f59b';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#00f59b';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          const eyeDist = 4;
          const eyeR = 2.5;
          let ex1 = cx + (this.dir.y !== 0 ? eyeDist : this.dir.x * 2);
          let ey1 = cy + (this.dir.x !== 0 ? eyeDist : this.dir.y * 2);
          let ex2 = cx - (this.dir.y !== 0 ? eyeDist : -this.dir.x * 2);
          let ey2 = cy - (this.dir.x !== 0 ? eyeDist : -this.dir.y * 2);

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2);
          ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#021208';
          ctx.beginPath();
          ctx.arc(ex1, ey1, 1, 0, Math.PI * 2);
          ctx.arc(ex2, ey2, 1, 0, Math.PI * 2);
          ctx.fill();

          // Flickering Red Forked Tongue
          if (Math.sin(Date.now() / 120) > 0.4) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            const tx = cx + this.dir.x * (radius + 6);
            const ty = cy + this.dir.y * (radius + 6);
            ctx.beginPath();
            ctx.moveTo(cx + this.dir.x * radius, cy + this.dir.y * radius);
            ctx.lineTo(tx, ty);
            ctx.lineTo(tx + (this.dir.y !== 0 ? 3 : 0), ty + (this.dir.x !== 0 ? 3 : 0));
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx - (this.dir.y !== 0 ? 3 : 0), ty - (this.dir.x !== 0 ? 3 : 0));
            ctx.stroke();
          }
        } else {
          // Body segment with scale pattern
          ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#059669';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();

          // Scale dot
          ctx.fillStyle = '#042f2e';
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }
  };

  // ==========================================================================
  // 2. GAME 2: AMAZON RIVER RAPIDS (HIGH-FIDELITY DRIFT)
  // ==========================================================================
  const riverGame = {
    canoe: { x: 0, y: 0, speed: 8, w: 28, h: 64 },
    obstacles: [],
    lilies: [],
    spawnTimer: 0,
    speed: 4.8,
    bankWidth: 55,

    init() {
      this.canoe.x = width / 2;
      this.canoe.y = height - 130;
      this.obstacles = [];
      this.lilies = [];
      this.spawnTimer = 0;
      this.speed = 4.8;
    },

    update(dt) {
      this.spawnTimer += dt;
      this.speed += dt * 0.04;

      if (this.spawnTimer > 0.85) {
        this.spawnTimer = 0;
        const rand = Math.random();

        if (rand < 0.45) {
          // Mossy River Boulder
          this.obstacles.push({
            type: 'boulder',
            x: this.bankWidth + 20 + Math.random() * (width - this.bankWidth * 2 - 80),
            y: -50,
            w: 42,
            h: 34
          });
        } else if (rand < 0.8) {
          // Floating Driftwood Log
          this.obstacles.push({
            type: 'log',
            x: this.bankWidth + 20 + Math.random() * (width - this.bankWidth * 2 - 80),
            y: -60,
            w: 58,
            h: 22
          });
        } else {
          // Swimming Amazon River Caiman (Crocodile)
          this.obstacles.push({
            type: 'caiman',
            x: this.bankWidth + 20 + Math.random() * (width - this.bankWidth * 2 - 80),
            y: -70,
            w: 36,
            h: 68,
            vx: (Math.random() - 0.5) * 1.5
          });
        }

        // Spawn Giant Water Lily
        if (Math.random() < 0.45) {
          this.lilies.push({
            x: this.bankWidth + 25 + Math.random() * (width - this.bankWidth * 2 - 60),
            y: -40,
            r: 16
          });
        }
      }

      // Move player canoe
      if (keys['ArrowLeft'] || keys['KeyA']) this.canoe.x -= this.canoe.speed;
      if (keys['ArrowRight'] || keys['KeyD']) this.canoe.x += this.canoe.speed;
      this.canoe.x = Math.max(this.bankWidth + 20, Math.min(width - this.bankWidth - 20, this.canoe.x));

      // Update obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.y += this.speed;
        if (obs.type === 'caiman') {
          obs.x += obs.vx;
          if (obs.x < this.bankWidth + 10 || obs.x > width - this.bankWidth - obs.w - 10) {
            obs.vx *= -1;
          }
        }

        // Precise Collision Check with Canoe
        if (
          this.canoe.x + this.canoe.w / 2 > obs.x &&
          this.canoe.x - this.canoe.w / 2 < obs.x + obs.w &&
          this.canoe.y + this.canoe.h / 2 > obs.y &&
          this.canoe.y - this.canoe.h / 2 < obs.y + obs.h
        ) {
          audio.playSplash();
          addShockwave(this.canoe.x, this.canoe.y, '#38bdf8');
          gameOver();
          return;
        }

        if (obs.y > height + 80) this.obstacles.splice(i, 1);
      }

      // Update Water Lilies
      for (let i = this.lilies.length - 1; i >= 0; i--) {
        const lily = this.lilies[i];
        lily.y += this.speed;

        const dist = Math.hypot(this.canoe.x - lily.x, this.canoe.y - lily.y);
        if (dist < this.canoe.w / 2 + lily.r) {
          audio.playEatChime();
          score += 150;
          scoreDisplay.textContent = String(score).padStart(5, '0');
          addFloatingText('+150', lily.x, lily.y, '#00f59b');
          addShockwave(lily.x, lily.y, '#f472b6');
          this.lilies.splice(i, 1);
          continue;
        }

        if (lily.y > height + 50) this.lilies.splice(i, 1);
      }
    },

    draw(ctx) {
      // 1. Rushing Amazon River Water Background
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(0, 0, width, height);

      // Flowing White-Water Current Ripples
      ctx.strokeStyle = '#00f59b';
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.25;
      const waveShift = (Date.now() / 4) % 60;
      for (let y = waveShift; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(this.bankWidth + 10, y);
        ctx.bezierCurveTo(width * 0.35, y + 15, width * 0.65, y - 15, width - this.bankWidth - 10, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 2. Lush Tropical Riverbanks (Left & Right)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, this.bankWidth, height);
      ctx.fillRect(width - this.bankWidth, 0, this.bankWidth, height);

      // Riverbank Foliage & Vines
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.bankWidth, 0);
      ctx.lineTo(this.bankWidth, height);
      ctx.moveTo(width - this.bankWidth, 0);
      ctx.lineTo(width - this.bankWidth, height);
      ctx.stroke();

      // 3. Draw Obstacles with Rich Visual Art
      this.obstacles.forEach(obs => {
        ctx.save();
        if (obs.type === 'boulder') {
          // Mossy River Boulder with Foam
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          // Moss top
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h * 0.35, obs.w * 0.4, obs.h * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          // Water foam at front
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y + obs.h * 0.85, obs.w * 0.45, 0, Math.PI);
          ctx.stroke();
        } else if (obs.type === 'log') {
          // Floating Driftwood Tree Trunk
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6);
          ctx.fill();
          // Wood grain lines
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + 8, obs.y + 6);
          ctx.lineTo(obs.x + obs.w - 8, obs.y + 6);
          ctx.moveTo(obs.x + 12, obs.y + 14);
          ctx.lineTo(obs.x + obs.w - 12, obs.y + 14);
          ctx.stroke();
        } else if (obs.type === 'caiman') {
          // Animated Amazon River Caiman
          ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
          ctx.fillStyle = '#064e3b';
          // Snout & head
          ctx.beginPath();
          ctx.ellipse(0, obs.h * 0.3, obs.w * 0.35, obs.h * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
          // Scaly body
          ctx.fillStyle = '#022c22';
          ctx.beginPath();
          ctx.ellipse(0, 0, obs.w * 0.45, obs.h * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          // Glowing Reptilian Eyes
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(-6, obs.h * 0.25, 2.5, 0, Math.PI * 2);
          ctx.arc(6, obs.h * 0.25, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 4. Draw Floating Water Lilies (Victoria Regia Lotus)
      this.lilies.forEach(l => {
        ctx.save();
        // Lily pad leaf
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fill();
        // Lotus Bloom in center
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Tribal Amazon Canoe (Player Craft)
      ctx.save();
      ctx.translate(this.canoe.x, this.canoe.y);

      // Trailing water wake
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, this.canoe.h / 2);
      ctx.lineTo(-24, this.canoe.h / 2 + 30);
      ctx.moveTo(10, this.canoe.h / 2);
      ctx.lineTo(24, this.canoe.h / 2 + 30);
      ctx.stroke();

      // Canoe Wooden Hull
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(0, -this.canoe.h / 2);
      ctx.bezierCurveTo(this.canoe.w / 2 + 4, -this.canoe.h * 0.2, this.canoe.w / 2 + 4, this.canoe.h * 0.3, 0, this.canoe.h / 2);
      ctx.bezierCurveTo(-this.canoe.w / 2 - 4, this.canoe.h * 0.3, -this.canoe.w / 2 - 4, -this.canoe.h * 0.2, 0, -this.canoe.h / 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Interior Bench & Paddler
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-8, -10, 16, 20);
      ctx.fillStyle = '#00f59b';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Animated Left & Right Wooden Oars
      const oarAngle = Math.sin(Date.now() / 120) * 0.25;
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      // Left oar
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-24 + oarAngle * 10, -2 + oarAngle * 8);
      ctx.stroke();
      // Right oar
      ctx.beginPath();
      ctx.moveTo(6, -2);
      ctx.lineTo(24 - oarAngle * 10, -2 + oarAngle * 8);
      ctx.stroke();

      ctx.restore();
    }
  };

  // ==========================================================================
  // 3. GAME 3: CANOPY WILDLIFE SPRINT (PARALLAX JAGUAR SPRINT)
  // ==========================================================================
  const canopyGame = {
    jaguar: { x: 120, y: 0, vy: 0, isGrounded: true, w: 54, h: 28 },
    obstacles: [],
    orchids: [],
    spawnTimer: 0,
    speed: 5.8,
    branchY: 0,

    init() {
      this.branchY = height - 120;
      this.jaguar.y = this.branchY;
      this.jaguar.vy = 0;
      this.jaguar.isGrounded = true;
      this.obstacles = [];
      this.orchids = [];
      this.spawnTimer = 0;
      this.speed = 5.8;
    },

    update(dt) {
      this.spawnTimer += dt;
      this.speed += dt * 0.04;

      // Jump control
      if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && this.jaguar.isGrounded) {
        this.jaguar.vy = -15;
        this.jaguar.isGrounded = false;
        audio.playEatChime();
        addShockwave(this.jaguar.x, this.branchY, '#facc15');
      }

      // Gravity physics
      this.jaguar.vy += 28 * dt;
      this.jaguar.y += this.jaguar.vy;

      if (this.jaguar.y >= this.branchY) {
        this.jaguar.y = this.branchY;
        this.jaguar.vy = 0;
        this.jaguar.isGrounded = true;
      }

      // Spawn Obstacles & Golden Orchids
      if (this.spawnTimer > 1.3) {
        this.spawnTimer = 0;
        // Spiky root obstacle
        this.obstacles.push({
          x: width + 30,
          y: this.branchY - 32,
          w: 26,
          h: 32
        });

        // Golden Orchid Collectible in air
        if (Math.random() < 0.6) {
          this.orchids.push({
            x: width + 100,
            y: this.branchY - 70,
            r: 12
          });
        }
      }

      // Update obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.speed;

        if (
          this.jaguar.x + this.jaguar.w / 2 > obs.x &&
          this.jaguar.x - this.jaguar.w / 2 < obs.x + obs.w &&
          this.jaguar.y + this.jaguar.h / 2 > obs.y
        ) {
          audio.playSplash();
          gameOver();
          return;
        }

        if (obs.x < -40) {
          score += 100;
          scoreDisplay.textContent = String(score).padStart(5, '0');
          this.obstacles.splice(i, 1);
        }
      }

      // Update Golden Orchids
      for (let i = this.orchids.length - 1; i >= 0; i--) {
        const orch = this.orchids[i];
        orch.x -= this.speed;

        const dist = Math.hypot(this.jaguar.x - orch.x, this.jaguar.y - orch.y);
        if (dist < this.jaguar.w / 2 + orch.r) {
          audio.playEatChime();
          score += 200;
          scoreDisplay.textContent = String(score).padStart(5, '0');
          addFloatingText('+200', orch.x, orch.y, '#facc15');
          addShockwave(orch.x, orch.y, '#facc15');
          this.orchids.splice(i, 1);
          continue;
        }

        if (orch.x < -30) this.orchids.splice(i, 1);
      }
    },

    draw(ctx) {
      // 1. Deep Rainforest Night Sky
      ctx.fillStyle = '#020b06';
      ctx.fillRect(0, 0, width, height);

      // Giant Glowing Rainforest Moon
      ctx.save();
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width - 120, 90, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Distant Misty Mountain Silhouettes (Parallax)
      ctx.fillStyle = '#042313';
      ctx.beginPath();
      ctx.moveTo(0, this.branchY);
      ctx.lineTo(width * 0.25, this.branchY - 120);
      ctx.lineTo(width * 0.55, this.branchY - 80);
      ctx.lineTo(width * 0.85, this.branchY - 140);
      ctx.lineTo(width, this.branchY);
      ctx.fill();

      // 2. Giant Mossy Ancient Ceiba Tree Branch (Floor)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, this.branchY, width, height - this.branchY);
      // Moss top line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, this.branchY);
      ctx.lineTo(width, this.branchY);
      ctx.stroke();

      // 3. Draw Strangler Fig Root Obstacles
      this.obstacles.forEach(obs => {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.lineTo(obs.x, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Floating Golden Orchids
      this.orchids.forEach(orch => {
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(orch.x, orch.y, orch.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(orch.x, orch.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Black Amazonian Jaguar (Animated Running Sprite)
      ctx.save();
      ctx.translate(this.jaguar.x, this.jaguar.y - this.jaguar.h / 2);

      // Running Legs Cycle
      const runCycle = Math.sin(Date.now() / 70) * 12;
      ctx.strokeStyle = '#051b10';
      ctx.lineWidth = 4;
      // Front legs
      ctx.beginPath();
      ctx.moveTo(14, 8);
      ctx.lineTo(18 + runCycle, 18);
      ctx.moveTo(10, 8);
      ctx.lineTo(12 - runCycle, 18);
      // Back legs
      ctx.moveTo(-14, 8);
      ctx.lineTo(-12 - runCycle, 18);
      ctx.moveTo(-18, 8);
      ctx.lineTo(-20 + runCycle, 18);
      ctx.stroke();

      // Sleek Muscular Body
      ctx.fillStyle = '#061d12';
      ctx.beginPath();
      ctx.roundRect(-22, -10, 44, 20, 8);
      ctx.fill();

      // Golden Spots
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-8, -4, 2, 0, Math.PI * 2);
      ctx.arc(4, 2, 2.5, 0, Math.PI * 2);
      ctx.arc(12, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Head & Ears
      ctx.fillStyle = '#061d12';
      ctx.beginPath();
      ctx.arc(22, -6, 9, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Yellow Eye
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(24, -7, 2, 0, Math.PI * 2);
      ctx.fill();

      // Swaying Tail
      ctx.strokeStyle = '#061d12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-22, -4);
      ctx.quadraticCurveTo(-34, -14 + runCycle * 0.4, -40, -8);
      ctx.stroke();

      ctx.restore();
    }
  };

  // --- CONTROLLER SWITCHER ---
  window.switchGame = function (gameName) {
    activeGame = gameName;

    document.querySelectorAll('.game-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-game-${gameName}`).classList.add('active');

    if (gameName === 'snake') {
      menuGameTitle.textContent = 'AMAZON ANACONDA';
      menuGameDesc.textContent = 'Guide the emerald anaconda across the moonlit rainforest canopy. Hunt glowing fireflies, avoid collisions with ancient mossy stones and your own body.';
      instDesktop.innerHTML = '<span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> or <span class="key">ARROWS</span> : Steer Anaconda';
    } else if (gameName === 'river') {
      menuGameTitle.textContent = 'RIVER RAPIDS';
      menuGameDesc.textContent = 'Paddle your dugout canoe down rushing Amazonian rapids! Dodge river boulders, floating logs, and caimans while collecting glowing water lilies!';
      instDesktop.innerHTML = '<span class="key">A</span> / <span class="key">D</span> or <span class="key">◄</span> / <span class="key">►</span> : Steer Canoe Left / Right';
    } else if (gameName === 'canopy') {
      menuGameTitle.textContent = 'CANOPY SPRINT';
      menuGameDesc.textContent = 'Guide the agile Amazonian jaguar sprinting along ancient high-canopy branches! Jump over bottomless ravines and collect golden orchids!';
      instDesktop.innerHTML = '<span class="key">SPACE</span> / <span class="key">W</span> / <span class="key">▲</span> : Jump over Roots &amp; Ravines';
    }

    updateHiScoreDisplay();
    state = 'MENU';
    menuOverlay.classList.remove('hidden');
    menuOverlay.classList.add('active');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
  };

  // --- MAIN ENGINE LOOP ---
  const keys = {};
  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Update active game
    if (state === 'PLAYING') {
      if (activeGame === 'snake') snakeGame.update(dt);
      else if (activeGame === 'river') riverGame.update(dt);
      else if (activeGame === 'canopy') canopyGame.update(dt);
    }

    // Render active game
    if (activeGame === 'snake') snakeGame.draw(ctx);
    else if (activeGame === 'river') riverGame.draw(ctx);
    else if (activeGame === 'canopy') canopyGame.draw(ctx);

    // Render Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 2.5;
      sw.alpha -= 0.04;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      if (sw.alpha <= 0) shockwaves.splice(i, 1);
    }

    // Render Floating Text Popups
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(ft.text, ft.x - 12, ft.y);
      ctx.restore();
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    // Ambient Drifting Fireflies
    ambientFireflies.forEach(ff => {
      ff.x += ff.vx;
      ff.y += ff.vy;
      if (ff.x < 0) ff.x = width;
      if (ff.x > width) ff.x = 0;
      if (ff.y < 0) ff.y = height;
      if (ff.y > height) ff.y = 0;

      ctx.save();
      ctx.fillStyle = ff.color;
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 300 + ff.x) * 0.3;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(loop);
  }

  // --- STATE CONTROLLERS ---
  function startGame() {
    audio.init();
    state = 'PLAYING';
    score = 0;
    scoreDisplay.textContent = '00000';
    floatingTexts = [];
    shockwaves = [];

    menuOverlay.classList.remove('active');
    menuOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    if (activeGame === 'snake') snakeGame.init();
    else if (activeGame === 'river') riverGame.init();
    else if (activeGame === 'canopy') canopyGame.init();
  }

  function pauseGame() {
    if (state === 'PLAYING') {
      state = 'PAUSED';
      pauseOverlay.classList.remove('hidden');
    } else if (state === 'PAUSED') {
      state = 'PLAYING';
      pauseOverlay.classList.add('hidden');
    }
  }

  function gameOver() {
    state = 'GAMEOVER';
    audio.playGameOverSound();
    finalScoreEl.textContent = score;

    const currentBest = hiScores[activeGame] || 0;
    if (score > currentBest) {
      hiScores[activeGame] = score;
      localStorage.setItem(`jungle_hiscore_${activeGame}`, score);
      updateHiScoreDisplay();
      newHiBanner.classList.remove('hidden');
    } else {
      newHiBanner.classList.add('hidden');
    }
    finalHiScoreEl.textContent = hiScores[activeGame];
    gameOverOverlay.classList.remove('hidden');
  }

  // --- EVENT LISTENERS ---
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') pauseGame();
    if (e.code === 'KeyM') {
      const active = audio.toggle();
      natureSoundBtn.innerHTML = active ? '🌊 AMBIENCE: ON' : '🔇 MUTED';
      natureSoundBtn.classList.toggle('nature-active', active);
    }

    if (activeGame === 'snake') {
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && snakeGame.dir.y === 0) {
        snakeGame.nextDir = { x: 0, y: -1 };
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && snakeGame.dir.y === 0) {
        snakeGame.nextDir = { x: 0, y: 1 };
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && snakeGame.dir.x === 0) {
        snakeGame.nextDir = { x: -1, y: 0 };
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && snakeGame.dir.x === 0) {
        snakeGame.nextDir = { x: 1, y: 0 };
      }
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  document.getElementById('start-game-btn').addEventListener('click', startGame);
  document.getElementById('restart-game-btn').addEventListener('click', startGame);
  document.getElementById('resume-btn').addEventListener('click', pauseGame);
  document.getElementById('restart-from-pause-btn').addEventListener('click', startGame);
  document.getElementById('pause-btn').addEventListener('click', pauseGame);

  natureSoundBtn.addEventListener('click', () => {
    audio.init();
    const active = audio.toggle();
    natureSoundBtn.innerHTML = active ? '🌊 AMBIENCE: ON' : '🔇 MUTED';
    natureSoundBtn.classList.toggle('nature-active', active);
  });

  const dpadUp = document.getElementById('dpad-up');
  const dpadDown = document.getElementById('dpad-down');
  const dpadLeft = document.getElementById('dpad-left');
  const dpadRight = document.getElementById('dpad-right');

  function handleDirection(dir) {
    audio.init();
    if (activeGame === 'snake') {
      if (dir === 'up' && snakeGame.dir.y === 0) snakeGame.nextDir = { x: 0, y: -1 };
      if (dir === 'down' && snakeGame.dir.y === 0) snakeGame.nextDir = { x: 0, y: 1 };
      if (dir === 'left' && snakeGame.dir.x === 0) snakeGame.nextDir = { x: -1, y: 0 };
      if (dir === 'right' && snakeGame.dir.x === 0) snakeGame.nextDir = { x: 1, y: 0 };
    } else if (activeGame === 'river') {
      if (dir === 'left') riverGame.canoe.x -= 30;
      if (dir === 'right') riverGame.canoe.x += 30;
    } else if (activeGame === 'canopy') {
      if ((dir === 'up' || dir === 'right') && canopyGame.jaguar.isGrounded) {
        canopyGame.jaguar.vy = -15;
        canopyGame.jaguar.isGrounded = false;
        audio.playEatChime();
      }
    }
  }

  if (dpadUp) dpadUp.addEventListener('touchstart', e => { e.preventDefault(); handleDirection('up'); });
  if (dpadDown) dpadDown.addEventListener('touchstart', e => { e.preventDefault(); handleDirection('down'); });
  if (dpadLeft) dpadLeft.addEventListener('touchstart', e => { e.preventDefault(); handleDirection('left'); });
  if (dpadRight) dpadRight.addEventListener('touchstart', e => { e.preventDefault(); handleDirection('right'); });

  // Start loop
  requestAnimationFrame(loop);
})();
