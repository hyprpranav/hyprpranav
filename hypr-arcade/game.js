/**
 * ============================================================================
 * HYPR ARCADE: QUANTUM INTERCEPTOR
 * Developer: HYPRPRANAV
 * Tech: Pure HTML5 Canvas, Vanilla ES6+ JavaScript, Web Audio API Synthesizer
 * Zero External Dependencies • 100% Mobile & Desktop Responsive
 * ============================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      const savedAudio = localStorage.getItem('hypr_arcade_audio');
      if (savedAudio !== null) {
        this.enabled = savedAudio === 'true';
      }
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

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('hypr_arcade_audio', this.enabled);
      return this.enabled;
    }

    playLaser() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    playExplosion() {
      if (!this.enabled || !this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
      } catch (e) {}
    }

    playEmpBoom() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
      } catch (e) {}
    }

    playPowerup() {
      if (!this.enabled || !this.ctx) return;
      try {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.05);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.05);
          osc.stop(this.ctx.currentTime + idx * 0.05 + 0.15);
        });
      } catch (e) {}
    }
  }

  // --- GAME ENGINE ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const audio = new SoundEngine();

  // DOM Elements
  const scoreDisplay = document.getElementById('score-display');
  const hiScoreDisplay = document.getElementById('hi-score-display');
  const multiplierDisplay = document.getElementById('multiplier-display');
  const healthBar = document.getElementById('health-bar');
  const empBar = document.getElementById('emp-bar');
  const menuOverlay = document.getElementById('menu-overlay');
  const pauseOverlay = document.getElementById('pause-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const finalScoreEl = document.getElementById('final-score');
  const finalComboEl = document.getElementById('final-combo');
  const finalKillsEl = document.getElementById('final-kills');
  const newHiBanner = document.getElementById('new-high-score-banner');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  // Game Global State
  let state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
  let score = 0;
  let kills = 0;
  let combo = 1.0;
  let comboTimer = 0;
  let maxComboRecorded = 1.0;
  let hiScore = parseInt(localStorage.getItem('hypr_arcade_hiscore') || '0', 10);
  hiScoreDisplay.textContent = String(hiScore).padStart(5, '0');

  // Input State
  const keys = {};
  let touchJoystick = { active: false, x: 0, y: 0 };
  let touchFiring = false;

  // Viewport Sizing
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

  // --- GAME OBJECTS & ARRAYS ---
  let stars = [];
  let hyperloopLines = [];
  let particles = [];
  let projectiles = [];
  let enemyProjectiles = [];
  let enemies = [];
  let powerups = [];
  let shockwaves = [];
  let screenShake = 0;

  // Background Starfield Setup
  function initBackground() {
    stars = [];
    const count = Math.floor((width * height) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 2.5,
        size: 0.8 + Math.random() * 1.8,
        color: Math.random() > 0.3 ? '#00f5d4' : '#a855f7',
        alpha: 0.3 + Math.random() * 0.7
      });
    }

    hyperloopLines = [];
    for (let i = 0; i < 6; i++) {
      hyperloopLines.push({
        x: (width / 7) * (i + 1),
        y: Math.random() * height,
        len: 80 + Math.random() * 140,
        speed: 8 + Math.random() * 6
      });
    }
  }

  // --- PLAYER STARFIGHTER ---
  const player = {
    x: width / 2,
    y: height - 120,
    vx: 0,
    vy: 0,
    speed: 7,
    size: 24,
    health: 100,
    maxHealth: 100,
    emp: 100,
    maxEmp: 100,
    shieldActive: false,
    tripleShotTime: 0,
    rapidFireTime: 0,
    invincibleTimer: 0,
    fireCooldown: 0,

    reset() {
      this.x = width / 2;
      this.y = height - 120;
      this.vx = 0;
      this.vy = 0;
      this.health = 100;
      this.emp = 100;
      this.shieldActive = false;
      this.tripleShotTime = 0;
      this.rapidFireTime = 0;
      this.invincibleTimer = 60;
    },

    update(dt) {
      // Input velocity calculation
      let ax = 0;
      let ay = 0;

      if (keys['ArrowLeft'] || keys['KeyA']) ax -= 1;
      if (keys['ArrowRight'] || keys['KeyD']) ax += 1;
      if (keys['ArrowUp'] || keys['KeyW']) ay -= 1;
      if (keys['ArrowDown'] || keys['KeyS']) ay += 1;

      // Touch joystick blend
      if (touchJoystick.active) {
        ax += touchJoystick.x;
        ay += touchJoystick.y;
      }

      // Normalize diagonal speed
      const len = Math.hypot(ax, ay);
      if (len > 0) {
        ax /= Math.max(1, len);
        ay /= Math.max(1, len);
      }

      this.vx = ax * this.speed;
      this.vy = ay * this.speed;

      this.x += this.vx;
      this.y += this.vy;

      // Bound within canvas
      this.x = Math.max(this.size + 10, Math.min(width - this.size - 10, this.x));
      this.y = Math.max(this.size + 20, Math.min(height - this.size - 20, this.y));

      // Timers & cooldowns
      if (this.invincibleTimer > 0) this.invincibleTimer--;
      if (this.tripleShotTime > 0) this.tripleShotTime -= dt;
      if (this.rapidFireTime > 0) this.rapidFireTime -= dt;
      if (this.fireCooldown > 0) this.fireCooldown -= dt;

      // EMP slow recharge
      if (this.emp < this.maxEmp) {
        this.emp = Math.min(this.maxEmp, this.emp + dt * 4);
      }

      // Auto-firing when Space or Left-Click or Touch Fire is pressed
      const firing = keys['Space'] || keys['Mouse0'] || touchFiring;
      const cooldownRate = this.rapidFireTime > 0 ? 0.08 : 0.15;
      if (firing && this.fireCooldown <= 0) {
        this.fire();
        this.fireCooldown = cooldownRate;
      }

      // Exhaust thruster particles
      if (Math.random() < 0.8) {
        particles.push({
          x: this.x + (Math.random() * 8 - 4),
          y: this.y + this.size + 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 3 + Math.random() * 3,
          life: 20,
          maxLife: 20,
          size: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#00f5d4' : '#00b4d8'
        });
      }
    },

    fire() {
      audio.playLaser();
      if (this.tripleShotTime > 0) {
        projectiles.push(
          { x: this.x - 12, y: this.y - 10, vx: -1.5, vy: -12, color: '#00f5d4' },
          { x: this.x, y: this.y - 18, vx: 0, vy: -14, color: '#00f5d4' },
          { x: this.x + 12, y: this.y - 10, vx: 1.5, vy: -12, color: '#00f5d4' }
        );
      } else {
        projectiles.push(
          { x: this.x - 8, y: this.y - 12, vx: 0, vy: -13, color: '#00f5d4' },
          { x: this.x + 8, y: this.y - 12, vx: 0, vy: -13, color: '#00f5d4' }
        );
      }
    },

    triggerEmp() {
      if (this.emp >= 80) {
        this.emp = 0;
        audio.playEmpBoom();
        screenShake = 18;
        shockwaves.push({
          x: this.x,
          y: this.y,
          r: 10,
          maxR: Math.max(width, height) * 0.8,
          alpha: 1.0,
          color: '#ff007f'
        });

        // Destroy / damage all current enemies on screen
        enemies.forEach(e => {
          e.hp -= 80;
          createExplosion(e.x, e.y, e.color, 15);
        });
        // Clear all enemy projectiles
        enemyProjectiles = [];
      }
    },

    takeDamage(amount) {
      if (this.invincibleTimer > 0) return;

      if (this.shieldActive) {
        this.shieldActive = false;
        this.invincibleTimer = 40;
        screenShake = 6;
        audio.playPowerup();
        return;
      }

      this.health -= amount;
      this.invincibleTimer = 50;
      screenShake = 10;
      audio.playExplosion();

      if (this.health <= 0) {
        this.health = 0;
        gameOver();
      }
    },

    draw(ctx) {
      if (this.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
        return; // Flicker during invincibility
      }

      ctx.save();
      ctx.translate(this.x, this.y);

      // Tilt angle based on horizontal velocity
      const tilt = (this.vx / this.speed) * 0.25;
      ctx.rotate(tilt);

      // Energy Shield Aura
      if (this.shieldActive) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      // Pod Ship Body
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size * 0.9, this.size * 0.8);
      ctx.lineTo(0, this.size * 0.5);
      ctx.lineTo(-this.size * 0.9, this.size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Glow
      ctx.beginPath();
      ctx.ellipse(0, -this.size * 0.2, 5, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.tripleShotTime > 0 ? '#ff007f' : '#00f5d4';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Wing Pylons
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-this.size * 0.85, 2, 4, 8);
      ctx.strokeRect(this.size * 0.85 - 4, 2, 4, 8);

      ctx.restore();
    }
  };

  // --- SPAWNERS & PARTICLES ---
  function createExplosion(x, y, color = '#00f5d4', count = 18) {
    audio.playExplosion();
    screenShake = Math.max(screenShake, 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        size: 2 + Math.random() * 3,
        color: color
      });
    }
  }

  let enemySpawnTimer = 0;
  function spawnEnemies(dt) {
    enemySpawnTimer += dt;
    const spawnRate = Math.max(0.6, 1.8 - kills * 0.02);

    if (enemySpawnTimer > spawnRate) {
      enemySpawnTimer = 0;
      const rand = Math.random();

      if (rand < 0.45) {
        // Scout Drone (Fast, zig-zag)
        enemies.push({
          type: 'scout',
          x: 40 + Math.random() * (width - 80),
          y: -30,
          hp: 20,
          maxHp: 20,
          size: 16,
          speed: 3.5 + Math.random() * 1.5,
          color: '#00b4d8',
          angle: 0,
          value: 100
        });
      } else if (rand < 0.8) {
        // Quantum Asteroid (Splits)
        enemies.push({
          type: 'asteroid',
          x: 40 + Math.random() * (width - 80),
          y: -40,
          hp: 40,
          maxHp: 40,
          size: 24,
          speed: 2 + Math.random() * 1.2,
          rot: 0,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          color: '#a855f7',
          value: 150
        });
      } else {
        // Heavy Interceptor (Shoots back)
        enemies.push({
          type: 'interceptor',
          x: 50 + Math.random() * (width - 100),
          y: -40,
          hp: 60,
          maxHp: 60,
          size: 22,
          speed: 1.6,
          color: '#ff007f',
          fireCooldown: 1.2 + Math.random() * 0.8,
          value: 250
        });
      }
    }
  }

  function spawnPowerup(x, y) {
    const types = ['shield', 'triple', 'overdrive'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      type: type,
      x: x,
      y: y,
      vy: 1.8,
      size: 14,
      color: type === 'shield' ? '#00f5d4' : type === 'triple' ? '#ff007f' : '#fbbf24'
    });
  }

  // --- GAME LOOP & UPDATES ---
  let lastTime = performance.now();

  function update(dt) {
    if (state !== 'PLAYING') return;

    // Screen Shake decay
    if (screenShake > 0) screenShake *= 0.9;
    if (screenShake < 0.2) screenShake = 0;

    // Combo timer
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) {
        combo = 1.0;
        multiplierDisplay.textContent = 'x1.0';
      }
    }

    // Background Starfield
    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = Math.random() * width;
      }
    });

    hyperloopLines.forEach(l => {
      l.y += l.speed;
      if (l.y > height) {
        l.y = -l.len;
        l.x = Math.random() * width;
      }
    });

    // Update Player
    player.update(dt);

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -20 || p.x < 0 || p.x > width) {
        projectiles.splice(i, 1);
      }
    }

    // Update Enemy Projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = enemyProjectiles[i];
      ep.x += ep.vx;
      ep.y += ep.vy;

      // Check collision with player
      const dist = Math.hypot(ep.x - player.x, ep.y - player.y);
      if (dist < player.size + ep.size) {
        player.takeDamage(15);
        enemyProjectiles.splice(i, 1);
        continue;
      }

      if (ep.y > height + 20) {
        enemyProjectiles.splice(i, 1);
      }
    }

    // Update Enemies & Spawning
    spawnEnemies(dt);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      if (e.type === 'scout') {
        e.angle += 0.05;
        e.x += Math.sin(e.angle) * 3;
        e.y += e.speed;
      } else if (e.type === 'asteroid') {
        e.y += e.speed;
        e.rot += e.rotSpeed;
      } else if (e.type === 'interceptor') {
        e.y += e.speed;
        e.fireCooldown -= dt;
        if (e.fireCooldown <= 0 && e.y < height - 150) {
          e.fireCooldown = 1.8;
          const angle = Math.atan2(player.y - e.y, player.x - e.x);
          enemyProjectiles.push({
            x: e.x,
            y: e.y + e.size,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            size: 5,
            color: '#ff007f'
          });
        }
      }

      // Check bullet collisions with enemy
      for (let j = projectiles.length - 1; j >= 0; j--) {
        const p = projectiles[j];
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (dist < e.size + 8) {
          projectiles.splice(j, 1);
          e.hp -= 20;

          // Tiny spark
          particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 10,
            maxLife: 10,
            size: 2,
            color: '#00f5d4'
          });

          if (e.hp <= 0) {
            // Enemy Destroyed
            createExplosion(e.x, e.y, e.color, 20);
            kills++;
            combo = Math.min(5.0, Number((combo + 0.2).toFixed(1)));
            comboTimer = 2.8;
            maxComboRecorded = Math.max(maxComboRecorded, combo);
            multiplierDisplay.textContent = `x${combo.toFixed(1)}`;

            score += Math.floor(e.value * combo);
            scoreDisplay.textContent = String(score).padStart(5, '0');

            // Chance to drop powerup
            if (Math.random() < 0.18) {
              spawnPowerup(e.x, e.y);
            }

            enemies.splice(i, 1);
            break;
          }
        }
      }

      // Player collision with enemy
      if (enemies[i]) {
        const pDist = Math.hypot(player.x - e.x, player.y - e.y);
        if (pDist < player.size + e.size) {
          player.takeDamage(25);
          createExplosion(e.x, e.y, e.color, 15);
          enemies.splice(i, 1);
          continue;
        }

        // Out of bounds cleanup
        if (e.y > height + 50) {
          enemies.splice(i, 1);
        }
      }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const pow = powerups[i];
      pow.y += pow.vy;

      const pDist = Math.hypot(player.x - pow.x, player.y - pow.y);
      if (pDist < player.size + pow.size) {
        audio.playPowerup();
        if (pow.type === 'shield') {
          player.shieldActive = true;
          player.health = Math.min(player.maxHealth, player.health + 20);
        } else if (pow.type === 'triple') {
          player.tripleShotTime = 12.0;
        } else if (pow.type === 'overdrive') {
          player.rapidFireTime = 8.0;
        }
        powerups.splice(i, 1);
        continue;
      }

      if (pow.y > height + 30) {
        powerups.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 16;
      sw.alpha = 1.0 - sw.r / sw.maxR;
      if (sw.r >= sw.maxR) {
        shockwaves.splice(i, 1);
      }
    }

    // Update HUD Meters
    healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    empBar.style.width = `${(player.emp / player.maxEmp) * 100}%`;
  }

  // --- RENDER PASS ---
  function render() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Screen Shake effect
    if (screenShake > 0) {
      const dx = (Math.random() - 0.5) * screenShake * 2;
      const dy = (Math.random() - 0.5) * screenShake * 2;
      ctx.translate(dx, dy);
    }

    // Hyperloop Warp Guide Lines
    ctx.lineWidth = 1;
    hyperloopLines.forEach(l => {
      const grad = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.len);
      grad.addColorStop(0, 'rgba(0, 245, 212, 0)');
      grad.addColorStop(0.5, 'rgba(0, 245, 212, 0.25)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x, l.y + l.len);
      ctx.stroke();
    });

    // Background Stars
    stars.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1.0;

    // Shockwaves
    shockwaves.forEach(sw => {
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;

    // Powerups
    powerups.forEach(pow => {
      ctx.save();
      ctx.translate(pow.x, pow.y);
      ctx.shadowColor = pow.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = pow.color;
      ctx.beginPath();
      ctx.arc(0, 0, pow.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060810';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pow.type[0].toUpperCase(), 0, 1);
      ctx.restore();
    });

    // Enemy Projectiles
    enemyProjectiles.forEach(ep => {
      ctx.shadowColor = ep.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = ep.color;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player Projectiles
    projectiles.forEach(p => {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 8, 4, 16);
    });

    // Enemies
    enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 8;

      if (e.type === 'scout') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, e.size);
        ctx.lineTo(e.size, -e.size * 0.7);
        ctx.lineTo(0, -e.size * 0.2);
        ctx.lineTo(-e.size, -e.size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'asteroid') {
        ctx.rotate(e.rot);
        ctx.fillStyle = '#1f1635';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const pts = 6;
        for (let k = 0; k < pts; k++) {
          const a = (k / pts) * Math.PI * 2;
          const r = e.size * (k % 2 === 0 ? 1 : 0.75);
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'interceptor') {
        ctx.fillStyle = '#2b0918';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, e.size * 1.2);
        ctx.lineTo(e.size, 0);
        ctx.lineTo(e.size * 0.6, -e.size);
        ctx.lineTo(-e.size * 0.6, -e.size);
        ctx.lineTo(-e.size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    // Player
    if (state === 'PLAYING') {
      player.draw(ctx);
    }

    // Particles
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life / pt.maxLife;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  // --- MAIN LOOP ---
  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(loop);
  }

  // --- STATE CONTROLLERS ---
  function startGame() {
    audio.init();
    state = 'PLAYING';
    score = 0;
    kills = 0;
    combo = 1.0;
    maxComboRecorded = 1.0;
    scoreDisplay.textContent = '00000';
    multiplierDisplay.textContent = 'x1.0';

    menuOverlay.classList.remove('active');
    menuOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    enemies = [];
    projectiles = [];
    enemyProjectiles = [];
    powerups = [];
    particles = [];
    shockwaves = [];

    initBackground();
    player.reset();
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
    finalScoreEl.textContent = score;
    finalComboEl.textContent = `x${maxComboRecorded.toFixed(1)}`;
    finalKillsEl.textContent = kills;

    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem('hypr_arcade_hiscore', hiScore);
      hiScoreDisplay.textContent = String(hiScore).padStart(5, '0');
      newHiBanner.classList.remove('hidden');
    } else {
      newHiBanner.classList.add('hidden');
    }

    gameOverOverlay.classList.remove('hidden');
  }

  // --- EVENT LISTENERS ---
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') pauseGame();
    if (e.code === 'KeyM') {
      const active = audio.toggle();
      audioToggleBtn.innerHTML = active ? '&#128266; SOUND: ON' : '&#128263; SOUND: MUTED';
    }
    if ((e.code === 'KeyE' || e.code === 'KeyX') && state === 'PLAYING') {
      player.triggerEmp();
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  // Mouse Controls
  canvas.addEventListener('mousedown', e => {
    audio.init();
    if (e.button === 0) keys['Mouse0'] = true;
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 0) keys['Mouse0'] = false;
  });

  // Buttons UI
  document.getElementById('start-game-btn').addEventListener('click', startGame);
  document.getElementById('restart-game-btn').addEventListener('click', startGame);
  document.getElementById('resume-btn').addEventListener('click', pauseGame);
  document.getElementById('restart-from-pause-btn').addEventListener('click', startGame);
  document.getElementById('pause-btn').addEventListener('click', pauseGame);

  audioToggleBtn.addEventListener('click', () => {
    audio.init();
    const active = audio.toggle();
    audioToggleBtn.innerHTML = active ? '&#128266; SOUND: ON' : '&#128263; SOUND: MUTED';
  });

  // Mobile Touch Virtual Joystick
  const joystickBase = document.getElementById('joystick-base');
  const joystickStick = document.getElementById('joystick-stick');
  const touchEmpBtn = document.getElementById('touch-emp-btn');
  const touchFireBtn = document.getElementById('touch-fire-btn');

  if (joystickBase) {
    let touchId = null;
    let baseRect = null;

    joystickBase.addEventListener('touchstart', e => {
      e.preventDefault();
      audio.init();
      baseRect = joystickBase.getBoundingClientRect();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      touchJoystick.active = true;
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (!touchJoystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId && baseRect) {
          const centerX = baseRect.left + baseRect.width / 2;
          const centerY = baseRect.top + baseRect.height / 2;
          const dx = t.clientX - centerX;
          const dy = t.clientY - centerY;
          const maxR = baseRect.width / 2;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxR);

          const stickX = Math.cos(angle) * clampedDist;
          const stickY = Math.sin(angle) * clampedDist;
          joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

          touchJoystick.x = stickX / maxR;
          touchJoystick.y = stickY / maxR;
        }
      }
    }, { passive: false });

    const endTouch = e => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchJoystick.active = false;
          touchJoystick.x = 0;
          touchJoystick.y = 0;
          joystickStick.style.transform = 'translate(0, 0)';
          touchId = null;
        }
      }
    };
    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }

  if (touchFireBtn) {
    touchFireBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      audio.init();
      touchFiring = true;
    }, { passive: false });
    touchFireBtn.addEventListener('touchend', () => { touchFiring = false; });
  }

  if (touchEmpBtn) {
    touchEmpBtn.addEventListener('touchstart', e => {
      e.preventDefault();
      audio.init();
      if (state === 'PLAYING') player.triggerEmp();
    }, { passive: false });
  }

  // Double tap canvas to EMP on mobile
  let lastTap = 0;
  canvas.addEventListener('touchend', e => {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 300 && tapLen > 0) {
      if (state === 'PLAYING') player.triggerEmp();
      e.preventDefault();
    }
    lastTap = curTime;
  });

  // Start animation loop
  initBackground();
  requestAnimationFrame(loop);
})();
