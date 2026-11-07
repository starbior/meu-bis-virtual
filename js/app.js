const ROOMS = [
  { id: 0, title: 'COZINHA' },
  { id: 1, title: 'BANHEIRO' },
  { id: 2, title: 'FLIPERAMA' },
  { id: 3, title: 'QUARTO' },
  { id: 4, title: 'CLOSET' },
];

const state = {
  roomIndex: 0,
  name: 'Bis',
  hunger: 80,
  clean: 75,
  fun: 85,
  energy: 90,
  coins: 120,
  isSleeping: false,
  isDancing: false,
  isPlayingBall: false,
  hasSoap: false,
  colors: {
    hi: '#8b5cf6',
    main: '#5b21ff',
    sh: '#350ca9',
  },
  accessory: 'keychain',
};

const rootStyle = document.documentElement.style;
const roomTitleEl = document.getElementById('room-title');
const roomDotsEl = document.getElementById('room-dots');
const dockPanels = document.querySelectorAll('.dock-panel');
const bisSvg = document.getElementById('bis-svg');
const bisWrapper = document.getElementById('bis-wrapper');
const bisNametag = document.getElementById('bis-nametag');
const bisNameInput = document.getElementById('bis-name-input');
const fxLayer = document.getElementById('stage-fx-layer');
const foamContainer = document.getElementById('foam-container');
const bouncingBall = document.getElementById('bouncing-ball');
const pupilLeft = document.getElementById('pupil-left');
const pupilRight = document.getElementById('pupil-right');
const eyesOpen = document.getElementById('bis-eyes-open');
const eyesClosed = document.getElementById('bis-eyes-closed');
const mouthEat = document.getElementById('bis-mouth-eat');
const dirtSpots = document.getElementById('bis-dirt-spots');
const accessoryLayer = document.getElementById('bis-accessory-layer');

// Acessórios com contorno cartoon alinhados na cabeça redonda (cx=190, topo y=81)
const ACCESSORIES = {
  none: '',
  keychain: `
    <g stroke="#1e0b36" stroke-width="3.5" stroke-linejoin="round">
      <path d="M 182 84 C 182 68, 198 68, 198 84" fill="none" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="198" cy="68" rx="7" ry="10" fill="none" stroke="#cbd5e1" stroke-width="4" transform="rotate(20 198 68)"/>
      <ellipse cx="210" cy="56" rx="7" ry="10" fill="none" stroke="#94a3b8" stroke-width="4" transform="rotate(35 210 56)"/>
      <circle cx="232" cy="42" r="21" fill="none" stroke="#1e0b36" stroke-width="8"/>
      <circle cx="232" cy="42" r="21" fill="none" stroke="#e2e8f0" stroke-width="4.5"/>
    </g>
  `,
  crown: `
    <g transform="translate(190, 76)" stroke="#1e0b36" stroke-width="4" stroke-linejoin="round">
      <polygon points="-34,12 -25,-20 0,-2 25,-20 34,12" fill="#facc15"/>
      <circle cx="0" cy="-2" r="4.5" fill="#f43f5e"/>
      <circle cx="-18" cy="2" r="4" fill="#38bdf8"/>
      <circle cx="18" cy="2" r="4" fill="#38bdf8"/>
    </g>
  `,
  shades: `
    <g transform="translate(190, 148)" stroke="#1e0b36" stroke-width="4" stroke-linejoin="round">
      <rect x="-58" y="-16" width="48" height="28" rx="6" fill="#111827"/>
      <rect x="10" y="-16" width="48" height="28" rx="6" fill="#111827"/>
      <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#facc15" stroke-width="5"/>
      <line x1="-46" y1="-8" x2="-24" y2="-8" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="22" y1="-8" x2="44" y2="-8" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  `,
  tophat: `
    <g transform="translate(190, 82)" stroke="#1e0b36" stroke-width="4" stroke-linejoin="round">
      <ellipse cx="0" cy="6" rx="48" ry="10" fill="#1e293b"/>
      <rect x="-28" y="-38" width="56" height="44" rx="6" fill="#334155"/>
      <rect x="-28" y="-8" width="56" height="10" fill="#f43f5e"/>
    </g>
  `,
  bow: `
    <g transform="translate(226, 92) rotate(18)" stroke="#1e0b36" stroke-width="4" stroke-linejoin="round">
      <polygon points="-26,-15 0,0 -26,15" fill="#f43f5e"/>
      <polygon points="26,-15 0,0 26,15" fill="#f43f5e"/>
      <circle cx="0" cy="0" r="7.5" fill="#fde047"/>
    </g>
  `,
};

function initDots() {
  roomDotsEl.innerHTML = ROOMS.map(
    (r, idx) => `<span class="room-dot ${idx === state.roomIndex ? 'active' : ''}" data-idx="${idx}"></span>`
  ).join('');
}

function goToRoom(index) {
  const total = ROOMS.length;
  state.roomIndex = (index + total) % total;
  rootStyle.setProperty('--room-index', state.roomIndex);

  const currentRoom = ROOMS[state.roomIndex];
  roomTitleEl.textContent = currentRoom.title;

  document.querySelectorAll('.room-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === state.roomIndex);
  });

  dockPanels.forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.dock) === state.roomIndex);
  });

  if (state.roomIndex !== 2) {
    stopPlayAnimations();
  }
  if (state.roomIndex !== 3 && state.isSleeping) {
    toggleSleep(false);
  }

  triggerSquish();
}

function stopPlayAnimations() {
  state.isDancing = false;
  state.isPlayingBall = false;
  bisSvg.classList.remove('anim-dance');
  bouncingBall.classList.remove('active');
}

function updateHUD() {
  const setBar = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = `${Math.max(8, Math.min(100, val))}%`;
    if (val < 30) el.style.background = '#ef4444';
    else if (val < 60) el.style.background = '#f59e0b';
    else el.style.background = '#22c55e';
  };

  setBar('hud-hunger', state.hunger);
  setBar('hud-clean', state.clean);
  setBar('hud-fun', state.fun);
  setBar('hud-energy', state.energy);

  document.getElementById('hud-coins').textContent = state.coins;
  bisNametag.textContent = state.name || 'Bis';

  const dirtOpacity = state.clean < 55 ? Math.min(0.85, (55 - state.clean) / 50) : 0;
  dirtSpots.setAttribute('opacity', dirtOpacity.toFixed(2));

  document.getElementById('grad-highlight').setAttribute('stop-color', state.colors.hi);
  document.getElementById('grad-main').setAttribute('stop-color', state.colors.main);
  document.getElementById('grad-shadow').setAttribute('stop-color', state.colors.sh);

  document.getElementById('seg-highlight').setAttribute('stop-color', state.colors.hi);
  document.getElementById('seg-main').setAttribute('stop-color', state.colors.main);
  document.getElementById('seg-shadow').setAttribute('stop-color', state.colors.sh);

  accessoryLayer.innerHTML = ACCESSORIES[state.accessory] || '';

  saveState();
}

function triggerSquish() {
  bisSvg.classList.remove('anim-squish');
  void bisSvg.offsetWidth;
  bisSvg.classList.add('anim-squish');
}

function spawnParticle(symbol, customX = null) {
  const el = document.createElement('div');
  el.className = 'fx-particle';
  el.textContent = symbol;
  const x = customX !== null ? customX : 115 + Math.random() * 140;
  const y = 65 + Math.random() * 70;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function blinkEyes(duration = 220) {
  if (state.isSleeping) return;
  eyesOpen.style.display = 'none';
  eyesClosed.style.display = 'block';
  setTimeout(() => {
    if (!state.isSleeping) {
      eyesOpen.style.display = 'block';
      eyesClosed.style.display = 'none';
    }
  }, duration);
}

// 1. COZINHA
document.querySelectorAll('[data-action="feed"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const foodEmoji = btn.dataset.food;
    const hungerGain = Number(btn.dataset.hunger || 15);
    const funGain = Number(btn.dataset.fun || 4);
    const coinGain = Number(btn.dataset.coins || 5);

    mouthEat.setAttribute('rx', '15');
    mouthEat.setAttribute('ry', '12');
    setTimeout(() => {
      mouthEat.setAttribute('rx', '0');
      mouthEat.setAttribute('ry', '0');
    }, 360);

    state.hunger = Math.min(100, state.hunger + hungerGain);
    state.fun = Math.min(100, state.fun + funGain);
    state.coins += coinGain;

    triggerSquish();
    blinkEyes(320);
    spawnParticle(foodEmoji);
    setTimeout(() => spawnParticle('💜'), 180);
    updateHUD();
  });
});

// 2. BANHEIRO
document.getElementById('btn-soap').addEventListener('click', () => {
  state.hasSoap = true;
  triggerSquish();
  for (let i = 0; i < 14; i++) {
    const b = document.createElement('div');
    b.className = 'soap-bubble';
    const size = 18 + Math.random() * 24;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${100 + Math.random() * 170}px`;
    b.style.top = `${75 + Math.random() * 145}px`;
    foamContainer.appendChild(b);
  }
  spawnParticle('🧼');
});

document.getElementById('btn-shower').addEventListener('click', () => {
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      drop.style.left = `${120 + Math.random() * 135}px`;
      drop.style.top = `35px`;
      fxLayer.appendChild(drop);
      setTimeout(() => drop.remove(), 550);
    }, i * 35);
  }

  setTimeout(() => {
    foamContainer.innerHTML = '';
    state.hasSoap = false;
    state.clean = 100;
    state.coins += 8;
    triggerSquish();
    blinkEyes(350);
    spawnParticle('✨');
    updateHUD();
  }, 450);
});

document.getElementById('btn-brush').addEventListener('click', () => {
  state.clean = Math.min(100, state.clean + 20);
  state.fun = Math.min(100, state.fun + 10);
  triggerSquish();
  spawnParticle('🦆');
  spawnParticle('✨');
  updateHUD();
});

// 3. FLIPERAMA / SALA DE JOGOS
document.getElementById('btn-ball').addEventListener('click', () => {
  state.isPlayingBall = !state.isPlayingBall;
  bouncingBall.classList.toggle('active', state.isPlayingBall);
  if (state.isPlayingBall) {
    state.fun = Math.min(100, state.fun + 16);
    state.energy = Math.max(0, state.energy - 6);
    state.coins += 10;
    triggerSquish();
    spawnParticle('⚽');
    updateHUD();
  }
});

document.getElementById('btn-dance').addEventListener('click', () => {
  state.isDancing = !state.isDancing;
  bisSvg.classList.toggle('anim-dance', state.isDancing);
  if (state.isDancing) {
    state.fun = Math.min(100, state.fun + 18);
    state.energy = Math.max(0, state.energy - 8);
    state.coins += 12;
    spawnParticle('🎵');
    setTimeout(() => spawnParticle('🎶'), 220);
    updateHUD();
  }
});

document.getElementById('btn-tickle').addEventListener('click', () => {
  state.fun = Math.min(100, state.fun + 14);
  state.coins += 6;
  triggerSquish();
  blinkEyes(400);
  spawnParticle('😆');
  spawnParticle('💜');
  updateHUD();
});

// 4. QUARTO
function toggleSleep(forceState = null) {
  state.isSleeping = forceState !== null ? forceState : !state.isSleeping;
  document.body.classList.toggle('is-sleeping', state.isSleeping);

  const iconEl = document.getElementById('sleep-btn-icon');
  const textEl = document.getElementById('sleep-btn-text');

  if (state.isSleeping) {
    eyesOpen.style.display = 'none';
    eyesClosed.style.display = 'block';
    iconEl.textContent = '☀️';
    textEl.textContent = 'Acender Luz';
    state.energy = Math.min(100, state.energy + 30);
    spawnParticle('💤');
  } else {
    eyesOpen.style.display = 'block';
    eyesClosed.style.display = 'none';
    iconEl.textContent = '💡';
    textEl.textContent = 'Apagar Luz';
  }
  updateHUD();
}

document.getElementById('btn-toggle-sleep').addEventListener('click', () => toggleSleep());
document.getElementById('room-lamp').addEventListener('click', () => toggleSleep());
document.getElementById('btn-lullaby').addEventListener('click', () => {
  state.energy = Math.min(100, state.energy + 15);
  spawnParticle('🎶');
  spawnParticle('🌙');
  blinkEyes(600);
  updateHUD();
});

// 5. CLOSET
document.getElementById('color-swatches').addEventListener('click', (e) => {
  const sw = e.target.closest('.swatch');
  if (!sw) return;
  document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
  sw.classList.add('active');
  state.colors = {
    hi: sw.dataset.hi,
    main: sw.dataset.main,
    sh: sw.dataset.sh,
  };
  triggerSquish();
  spawnParticle('🎨');
  updateHUD();
});

document.getElementById('accessory-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-btn');
  if (!btn) return;
  document.querySelectorAll('#accessory-buttons .chip-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.accessory = btn.dataset.acc;
  triggerSquish();
  spawnParticle('✨');
  updateHUD();
});

bisNameInput.addEventListener('input', (e) => {
  state.name = e.target.value.trim() || 'Bis';
  updateHUD();
});

document.getElementById('btn-random-bis').addEventListener('click', () => {
  const swatches = Array.from(document.querySelectorAll('.swatch'));
  const accs = Array.from(document.querySelectorAll('#accessory-buttons .chip-btn'));
  swatches[Math.floor(Math.random() * swatches.length)].click();
  accs[Math.floor(Math.random() * accs.length)].click();
});

bisWrapper.addEventListener('click', () => {
  if (state.isSleeping) {
    spawnParticle('💤');
    return;
  }
  state.fun = Math.min(100, state.fun + 5);
  triggerSquish();
  blinkEyes(260);
  spawnParticle('💜');
  updateHUD();
});

// NAVEGAÇÃO HORIZONTAL
document.getElementById('btn-prev-room').addEventListener('click', () => goToRoom(state.roomIndex - 1));
document.getElementById('btn-next-room').addEventListener('click', () => goToRoom(state.roomIndex + 1));

window.addEventListener('keydown', (e) => {
  if (document.activeElement === bisNameInput) return;
  if (e.key === 'ArrowLeft') goToRoom(state.roomIndex - 1);
  if (e.key === 'ArrowRight') goToRoom(state.roomIndex + 1);
});

let wheelCooldown = false;
window.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    if (wheelCooldown) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 18) return;

    wheelCooldown = true;
    if (delta > 0) goToRoom(state.roomIndex + 1);
    else goToRoom(state.roomIndex - 1);

    setTimeout(() => {
      wheelCooldown = false;
    }, 480);
  },
  { passive: false }
);

let touchStartX = null;
window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button, input')) return;
  touchStartX = e.clientX;
});

window.addEventListener('pointerup', (e) => {
  if (touchStartX === null) return;
  const diffX = e.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(diffX) > 65) {
    if (diffX < 0) goToRoom(state.roomIndex + 1);
    else goToRoom(state.roomIndex - 1);
  }
});

// OLHOS SEGUINDO O CURSOR
window.addEventListener('pointermove', (e) => {
  if (state.isSleeping) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = Math.max(-5, Math.min(5, (e.clientX - cx) / 45));
  const dy = Math.max(-4, Math.min(4, (e.clientY - cy) / 45));

  pupilLeft.setAttribute('transform', `translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`);
  pupilRight.setAttribute('transform', `translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`);
});

setInterval(() => {
  if (!state.isSleeping && Math.random() < 0.65) {
    blinkEyes(170);
  }
  if (state.isSleeping) {
    spawnParticle('💤');
    state.energy = Math.min(100, state.energy + 4);
    updateHUD();
  }
}, 3400);

function saveState() {
  try {
    localStorage.setItem('bis-pou-save-v3', JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('bis-pou-save-v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed, { isSleeping: false, isDancing: false, isPlayingBall: false });
      bisNameInput.value = state.name;
    }
  } catch (_) {}
}

loadState();
initDots();
goToRoom(state.roomIndex);
updateHUD();
