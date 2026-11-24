/**
 * ============================================================================
 * AMAZON JUNGLE ARCADE // 3-IN-1 NATURE SANCTUARY
 * Developer: Harish Pranav S (hyprpranav)
 * Tech: Pure HTML5 Canvas • Procedural Nature Sound Synthesizer (Web Audio API)
 * Zero External Assets • 100% Mobile & Desktop Responsive
 * ============================================================================
 */

(function () {
  'use strict';

  // --- PROCEDURAL NATURE AMBIENCE & SOUND ENGINE (Web Audio API) ---
  class NatureAudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.riverNode = null;
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
        // 1. Continuous Gentle Amazon River Flow (Filtered White Noise)
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
        riverFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
        riverFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        const riverGain = this.ctx.createGain();
        riverGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        whiteNoise.connect(riverFilter);
        riverFilter.connect(riverGain);
        riverGain.connect(this.ctx.destination);
        whiteNoise.start();
        this.riverNode = { source: whiteNoise, gain: riverGain };

        // 2. Periodic Nocturnal Rainforest Crickets / Cicadas Chirp
        this.scheduleCricketChirp();
      } catch (e) {}
    }

    scheduleCricketChirp() {
      if (!this.enabled || !this.ctx) return;
      const nextChirp = 3000 + Math.random() * 4000;
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
        osc.frequency.setValueAtTime(4500, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(4700, this.ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(4400, this.ctx.currentTime + 0.16);

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
      if (this.riverNode && this.riverNode.gain) {
        this.riverNode.gain.gain.setValueAtTime(this.enabled ? 0.08 : 0, this.ctx.currentTime);
      }
      return this.enabled;
    }

    playEatChime() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    playSplash() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }

    playGameOverSound() {
      if (!this.enabled || !this.ctx) return;
      try {
        const notes = [329.63, 293.66, 261.63];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.12 + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + i * 0.12);
          osc.stop(this.ctx.currentTime + i * 0.12 + 0.18);
        });
      } catch (e) {}
    }
  }

  // --- CANVAS & STATE SETUP ---
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

  // Game Engine Global State
  let activeGame = 'snake'; // 'snake' | 'river' | 'canopy'
  let state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
  let score = 0;
  let hiScores = {
    snake: parseInt(localStorage.getItem('jungle_hiscore_snake') || '0', 10),
    river: parseInt(localStorage.getItem('jungle_hiscore_river') || '0', 10),
    canopy: parseInt(localStorage.getItem('jungle_hiscore_canopy') || '0', 10)
  };
  updateHiScoreDisplay();

  // Canvas Viewport Sizing
  let width = 0;
  let height = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener('resize', resize);
  resize();

  function updateHiScoreDisplay() {
    hiScoreDisplay.textContent = String(hiScores[activeGame] || 0).padStart(5, '0');
  }

  // ==========================================================================
  // GAME 1: AMAZON ANACONDA (SNAKE)
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
    stepSpeed: 0.11, // seconds per step

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

      // Wall collision (ancient mossy stones)
      if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
        gameOver();
        return;
      }

      // Self collision
      if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
      }

      this.snake.unshift(head);

      // Eat firefly food
      if (head.x === this.food.x && head.y === this.food.y) {
        audio.playEatChime();
        score += 100;
        scoreDisplay.textContent = String(score).padStart(5, '0');
        this.stepSpeed = Math.max(0.065, this.stepSpeed - 0.001);
        this.spawnFood();
      } else {
        this.snake.pop();
      }
    },

    draw(ctx) {
      // Draw jungle moss grid floor
      ctx.fillStyle = '#020d06';
      ctx.fillRect(0, 0, width, height);

      // Draw glowing firefly food
      const fx = this.food.x * this.gridSize + this.gridSize / 2;
      const fy = this.food.y * this.gridSize + this.gridSize / 2;

      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(fx, fy, this.gridSize * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Anaconda segments with smooth emerald gradient
      this.snake.forEach((seg, i) => {
        const x = seg.x * this.gridSize;
        const y = seg.y * this.gridSize;

        ctx.save();
        if (i === 0) {
          // Head
          ctx.fillStyle = '#00f59b';
          ctx.shadowColor = '#00f59b';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 6);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#021208';
          ctx.beginPath();
          ctx.arc(x + this.gridSize * 0.3, y + this.gridSize * 0.35, 2, 0, Math.PI * 2);
          ctx.arc(x + this.gridSize * 0.7, y + this.gridSize * 0.35, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body
          const alpha = Math.max(0.4, 1 - (i / this.snake.length) * 0.6);
          ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#047857';
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 4);
          ctx.fill();
        }
        ctx.restore();
      });
    }
  };

  // ==========================================================================
  // GAME 2: AMAZON RIVER RAPIDS (DRIFT RUNNER)
  // ==========================================================================
  const riverGame = {
    raft: { x: 0, y: 0, speed: 7, size: 24 },
    obstacles: [],
    lilies: [],
    spawnTimer: 0,
    speed: 4.5,

    init() {
      this.raft.x = width / 2;
      this.raft.y = height - 120;
      this.obstacles = [];
      this.lilies = [];
      this.spawnTimer = 0;
      this.speed = 4.5;
    },

    update(dt) {
      this.spawnTimer += dt;
      this.speed += dt * 0.04;

      if (this.spawnTimer > 0.8) {
        this.spawnTimer = 0;
        // Spawn river rock or floating driftwood
        this.obstacles.push({
          x: 60 + Math.random() * (width - 120),
          y: -40,
          w: 36 + Math.random() * 24,
          h: 22 + Math.random() * 12,
          color: Math.random() > 0.5 ? '#78350f' : '#334155'
        });

        // Spawn glowing water lily
        if (Math.random() < 0.4) {
          this.lilies.push({
            x: 80 + Math.random() * (width - 160),
            y: -30,
            r: 14
          });
        }
      }

      // Move player raft
      if (keys['ArrowLeft'] || keys['KeyA']) this.raft.x -= this.raft.speed;
      if (keys['ArrowRight'] || keys['KeyD']) this.raft.x += this.raft.speed;
      this.raft.x = Math.max(50, Math.min(width - 50, this.raft.x));

      // Update obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.y += this.speed;

        // Collision check
        if (
          this.raft.x + this.raft.size > obs.x &&
          this.raft.x - this.raft.size < obs.x + obs.w &&
          this.raft.y + this.raft.size > obs.y &&
          this.raft.y - this.raft.size < obs.y + obs.h
        ) {
          audio.playSplash();
          gameOver();
          return;
        }

        if (obs.y > height + 50) this.obstacles.splice(i, 1);
      }

      // Update water lilies
      for (let i = this.lilies.length - 1; i >= 0; i--) {
        const lily = this.lilies[i];
        lily.y += this.speed;

        const dist = Math.hypot(this.raft.x - lily.x, this.raft.y - lily.y);
        if (dist < this.raft.size + lily.r) {
          audio.playEatChime();
          score += 150;
          scoreDisplay.textContent = String(score).padStart(5, '0');
          this.lilies.splice(i, 1);
          continue;
        }

        if (lily.y > height + 40) this.lilies.splice(i, 1);
      }
    },

    draw(ctx) {
      // River water background
      ctx.fillStyle = '#042f2e';
      ctx.fillRect(0, 0, width, height);

      // Lush green river banks on left & right
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, 45, height);
      ctx.fillRect(width - 45, 0, 45, height);

      // River flow ripple lines
      ctx.strokeStyle = '#00f59b';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.3;
      for (let y = (Date.now() / 8) % 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(width - 50, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Draw obstacles (rocks / logs)
      this.obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6);
        ctx.fill();
      });

      // Draw Water Lilies
      this.lilies.forEach(l => {
        ctx.shadowColor = '#00f59b';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00f59b';
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Player Raft / Otter
      ctx.save();
      ctx.translate(this.raft.x, this.raft.y);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  };

  // ==========================================================================
  // GAME 3: CANOPY WILDLIFE SPRINT
  // ==========================================================================
  const canopyGame = {
    jaguar: { x: 100, y: 0, vy: 0, isGrounded: true, size: 26 },
    obstacles: [],
    spawnTimer: 0,
    speed: 5.5,
    groundY: 0,

    init() {
      this.groundY = height - 100;
      this.jaguar.y = this.groundY;
      this.jaguar.vy = 0;
      this.jaguar.isGrounded = true;
      this.obstacles = [];
      this.spawnTimer = 0;
      this.speed = 5.5;
    },

    update(dt) {
      this.spawnTimer += dt;
      this.speed += dt * 0.05;

      // Jump control
      if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && this.jaguar.isGrounded) {
        this.jaguar.vy = -14;
        this.jaguar.isGrounded = false;
        audio.playEatChime();
      }

      // Gravity physics
      this.jaguar.vy += 26 * dt;
      this.jaguar.y += this.jaguar.vy;

      if (this.jaguar.y >= this.groundY) {
        this.jaguar.y = this.groundY;
        this.jaguar.vy = 0;
        this.jaguar.isGrounded = true;
      }

      // Obstacle spawning
      if (this.spawnTimer > 1.4) {
        this.spawnTimer = 0;
        this.obstacles.push({
          x: width + 20,
          y: this.groundY - 30,
          w: 24,
          h: 30
        });
      }

      // Update obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.speed;

        // Collision check
        if (
          this.jaguar.x + this.jaguar.size > obs.x &&
          this.jaguar.x - this.jaguar.size < obs.x + obs.w &&
          this.jaguar.y > obs.y - 10
        ) {
          audio.playSplash();
          gameOver();
          return;
        }

        if (obs.x < -40) {
          score += 120;
          scoreDisplay.textContent = String(score).padStart(5, '0');
          this.obstacles.splice(i, 1);
        }
      }
    },

    draw(ctx) {
      // Rainforest canopy background
      ctx.fillStyle = '#020d06';
      ctx.fillRect(0, 0, width, height);

      // Huge mossy tree trunk branch (Floor)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, this.groundY + 10, width, height - this.groundY);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY + 10);
      ctx.lineTo(width, this.groundY + 10);
      ctx.stroke();

      // Draw Strangler Fig Vines / Obstacles
      ctx.fillStyle = '#78350f';
      this.obstacles.forEach(obs => {
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h + 20, 4);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
      });

      // Draw Agile Jaguar
      ctx.save();
      ctx.translate(this.jaguar.x, this.jaguar.y);
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 22, 6);
      ctx.fill();
      // Jaguar spots
      ctx.fillStyle = '#021208';
      ctx.beginPath();
      ctx.arc(-8, -10, 2, 0, Math.PI * 2);
      ctx.arc(6, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
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
      menuGameDesc.textContent = 'Guide the emerald anaconda across the moonlit Amazon rainforest. Hunt glowing fireflies, avoid collisions with ancient mossy stones and your own body.';
      instDesktop.innerHTML = '<span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span> or <span class="key">ARROWS</span> : Steer Anaconda';
    } else if (gameName === 'river') {
      menuGameTitle.textContent = 'RIVER RAPIDS';
      menuGameDesc.textContent = 'Steer your canoe down the rushing Amazon River. Dodge river rocks and driftwood logs while collecting glowing water lilies!';
      instDesktop.innerHTML = '<span class="key">A</span> / <span class="key">D</span> or <span class="key">◄</span> / <span class="key">►</span> : Steer Raft Left / Right';
    } else if (gameName === 'canopy') {
      menuGameTitle.textContent = 'CANOPY SPRINT';
      menuGameDesc.textContent = 'Leap across giant ancient tree branches high in the Amazon canopy. Jump over ravines and duck under strangler fig vines!';
      instDesktop.innerHTML = '<span class="key">SPACE</span> / <span class="key">W</span> / <span class="key">▲</span> : Jump over Vines';
    }

    updateHiScoreDisplay();
    state = 'MENU';
    menuOverlay.classList.remove('hidden');
    menuOverlay.classList.add('active');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
  };

  // --- GAME LOOP ---
  const keys = {};
  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (state === 'PLAYING') {
      if (activeGame === 'snake') snakeGame.update(dt);
      else if (activeGame === 'river') riverGame.update(dt);
      else if (activeGame === 'canopy') canopyGame.update(dt);
    }

    // Render pass
    if (activeGame === 'snake') snakeGame.draw(ctx);
    else if (activeGame === 'river') riverGame.draw(ctx);
    else if (activeGame === 'canopy') canopyGame.draw(ctx);

    requestAnimationFrame(loop);
  }

  // --- STATE CONTROLLERS ---
  function startGame() {
    audio.init();
    state = 'PLAYING';
    score = 0;
    scoreDisplay.textContent = '00000';

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

    // Snake controls
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

  // Buttons
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

  // Mobile D-Pad Buttons
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
      if (dir === 'left') riverGame.raft.x -= 30;
      if (dir === 'right') riverGame.raft.x += 30;
    } else if (activeGame === 'canopy') {
      if ((dir === 'up' || dir === 'right') && canopyGame.jaguar.isGrounded) {
        canopyGame.jaguar.vy = -14;
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
