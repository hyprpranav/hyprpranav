# 🎮 HYPR ARCADE // Quantum Interceptor

> A lightweight, retro-futuristic arcade space shooter and kinetic hyperloop corridor interceptor engineered with pure **HTML5 Canvas**, **Vanilla JavaScript (ES6+)**, and real-time procedural sound synthesized via the **Web Audio API**.

---

## 🚀 Live Deployment Options

You can host and deploy **HYPR ARCADE** in less than 60 seconds with zero backend dependencies:

### Option 1: GitHub Pages (Recommended)
1. In your GitHub repository (`readme_hyprpranav` or a dedicated `hypr-arcade` repo), navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Branch**, choose `main` and set the folder to `/hypr-arcade` (or `/root` if hosted as an independent repository).
3. Click **Save**. Your game will be live at:
   ```
   https://hyprpranav.github.io/hypr-arcade/
   ```

### Option 2: Vercel (1-Click Deployment)
1. Install Vercel CLI (`npm i -g vercel`) or import the folder directly on [vercel.com](https://vercel.com).
2. Run `vercel deploy` inside the `hypr-arcade` directory.
3. Your game is immediately accessible worldwide with custom domain support and fast CDN caching.

---

## 🕹️ Controls

### Desktop Controls
| Input | Action |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>▲</kbd> <kbd>◄</kbd> <kbd>▼</kbd> <kbd>►</kbd> | Pilot interceptor ship |
| <kbd>Space</kbd> or <kbd>Left Mouse Click</kbd> | Fire dual plasma cannons |
| <kbd>E</kbd> or <kbd>X</kbd> | Discharge Quantum Overdrive EMP blast (Clears screen) |
| <kbd>P</kbd> | Pause / Resume tactical HUD |
| <kbd>M</kbd> | Mute / Unmute procedural sound synthesizer |

### Mobile & Tablet Controls
- **Virtual On-Screen Joystick**: Smooth 360-degree pilot navigation.
- **Auto-Fire / Fire Button**: Continuous high-velocity plasma blasters.
- **EMP Button / Double-Tap**: Instant screen-clearing kinetic pulse.

---

## ⚡ Technical Features

- **Procedural Sound Engine**: Synthesizes laser discharges, explosions, and powerup chimes using `AudioContext`, oscillators, and noise buffers (zero external `.mp3` dependencies that can break or fail to load).
- **Dynamic Starfield & Hyperloop Conduit**: Multi-layered parallax depth simulation with high-velocity light trails.
- **Tactical Powerups**:
  - 🛡️ **Shield Matrix**: Absorbs direct hull impacts and recharges player vitality.
  - ⚡ **Triple Plasma Spreader**: Tri-directional wide-beam cannon overclock.
  - 🔋 **Rapid Overclock**: High-frequency cycling for maximum DPS.
- **Local Record Persistence**: High scores and audio settings are safely remembered across sessions via browser `localStorage`.
- **Ultra-lightweight footprint**: Weighs less than **40 KB** total! Zero external frameworks or heavy libraries.

---

**Crafted with ⚡ by [HYPRPRANAV](https://github.com/hyprpranav)**
