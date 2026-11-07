const ROOMS = [
  { id: 0, title: 'Cozinha' },
  { id: 1, title: 'Banheiro' },
  { id: 2, title: 'Jogos' },
  { id: 3, title: 'Quarto' },
  { id: 4, title: 'Closet' },
];

const state = {
  roomIndex: 0,
  name: 'Bis',
  hunger: 82,
  clean: 78,
  fun: 88,
  energy: 92,
  coins: 120,
  isSleeping: false,
  isDancing: false,
  isPlayingBall: false,
  hasSoap: false,
  colors: {
    hi: '#9d74ff',
    main: '#5e24ff',
    sh: '#310a9e',
  },
  accessory: 'keychain',
};

// Elementos
const rootStyle = document.documentElement.style;
const roomTitleEl = document.getElementById('room-title');
const dockPanels = document.querySelectorAll('.room-items');
const bisPhysicsRoot = document.getElementById('bis-physics-root');
const bisHeadGroup = document.getElementById('bis-head-group');
const bisShadow = document.getElementById('bis-shadow');
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
const tentacleGroups = document.querySelectorAll('.tentacle-proc');

// Acessórios SEM contorno preto (lineless 3D)
const ACCESSORIES = {
  none: '',
  keychain: `
    <g>
      <path d="M 182 82 C 182 66, 198 66, 198 82" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="198" cy="66" rx="7" ry="10" fill="none" stroke="#e2e8f0" stroke-width="4" transform="rotate(20 198 66)"/>
      <ellipse cx="210" cy="54" rx="7" ry="10" fill="none" stroke="#94a3b8" stroke-width="4" transform="rotate(35 210 54)"/>
      <circle cx="232" cy="40" r="21" fill="none" stroke="#e2e8f0" stroke-width="5.5"/>
    </g>
  `,
  crown: `
    <g transform="translate(190, 75)">
      <polygon points="-32,12 -24,-20 0,-3 24,-20 32,12" fill="#facc15"/>
      <circle cx="0" cy="-2" r="4.5" fill="#f43f5e"/>
      <circle cx="-16" cy="2" r="4" fill="#38bdf8"/>
      <circle cx="16" cy="2" r="4" fill="#38bdf8"/>
    </g>
  `,
  shades: `
    <g transform="translate(190, 146)">
      <rect x="-56" y="-15" width="46" height="26" rx="7" fill="#0f172a"/>
      <rect x="10" y="-15" width="46" height="26" rx="7" fill="#0f172a"/>
      <rect x="-10" y="-6" width="20" height="4" rx="2" fill="#facc15"/>
      <line x1="-44" y1="-7" x2="-24" y2="-7" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="22" y1="-7" x2="42" y2="-7" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  `,
  tophat: `
    <g transform="translate(190, 80)">
      <ellipse cx="0" cy="6" rx="46" ry="9" fill="#1e293b"/>
      <rect x="-26" y="-36" width="52" height="42" rx="6" fill="#334155"/>
      <rect x="-26" y="-7" width="52" height="9" fill="#f43f5e"/>
    </g>
  `,
  bow: `
    <g transform="translate(226, 90) rotate(18)">
      <polygon points="-25,-14 0,0 -25,14" fill="#f43f5e"/>
      <polygon points="25,-14 0,0 25,14" fill="#f43f5e"/>
      <circle cx="0" cy="0" r="7" fill="#fde047"/>
    </g>
  `,
};

// ================= MOTOR DE FÍSICA ELÁSTICA E ANIMAÇÃO VIVA DO BIS =================
const spring = {
  scaleX: 1,
  scaleY: 1,
  velX: 0,
  velY: 0,
  yOffset: 0,
  velYOffset: 0,
  tilt: 0,
  velTilt: 0,
  excitement: 0, // Aumenta velocidade dos tentáculos quando interage
};

function impulseBis({ sx = 1.18, sy = 0.84, vy = -10, tilt = 0, excite = 1.2 } = {}) {
  spring.scaleX = sx;
  spring.scaleY = sy;
  spring.velYOffset = vy;
  spring.velTilt = tilt;
  spring.excitement = Math.min(2.5, spring.excitement + excite);
}

let startTime = performance.now();
function animateBisLoop(now) {
  const t = (now - startTime) / 1000;

  // Decai a empolgação suavemente
  spring.excitement = Math.max(0, spring.excitement * 0.96);

  // Força de mola (Spring-Damper) para escala e posição
  const k = 0.18;
  const damp = 0.78;

  spring.velX = (spring.velX + (1 - spring.scaleX) * k) * damp;
  spring.velY = (spring.velY + (1 - spring.scaleY) * k) * damp;
  spring.scaleX += spring.velX;
  spring.scaleY += spring.velY;

  spring.velYOffset = (spring.velYOffset + (0 - spring.yOffset) * 0.14) * 0.82;
  spring.yOffset += spring.velYOffset;

  spring.velTilt = (spring.velTilt + (0 - spring.tilt) * 0.12) * 0.82;
  spring.tilt += spring.velTilt;

  // Respiração orgânica + Dança ou Bola
  const breathSpeed = state.isSleeping ? 1.6 : 3.2;
  const breathY = Math.sin(t * breathSpeed) * (state.isSleeping ? 3 : 6);
  const breathScale = Math.sin(t * breathSpeed) * 0.025;

  let danceX = 0;
  let danceRot = 0;
  let danceJump = 0;

  if (state.isDancing) {
    danceX = Math.sin(t * 9) * 16;
    danceRot = Math.sin(t * 9) * 8;
    danceJump = -Math.abs(Math.cos(t * 9)) * 18;
  } else if (state.isPlayingBall) {
    danceJump = -Math.abs(Math.sin(t * 5.7)) * 16;
  }

  const finalY = breathY + spring.yOffset + danceJump;
  const finalSX = spring.scaleX + breathScale;
  const finalSY = spring.scaleY - breathScale;
  const finalRot = spring.tilt + danceRot;

  bisPhysicsRoot.setAttribute(
    'transform',
    `translate(${190 + danceX}, ${240 + finalY}) rotate(${finalRot.toFixed(2)}) scale(${finalSX.toFixed(3)}, ${finalSY.toFixed(3)}) translate(-190, -240)`
  );

  // Cabeça redonda com leve balanço secundário (follow-through)
  const headBob = Math.sin(t * breathSpeed - 0.5) * 3.5;
  const headTilt = Math.cos(t * 2.2) * (state.isSleeping ? 0.5 : 1.8);
  bisHeadGroup.setAttribute(
    'transform',
    `translate(190, ${142 + headBob}) rotate(${headTilt.toFixed(2)}) translate(-190, -142)`
  );

  // Sombra acompanha o pulo
  const shadowScale = Math.max(0.75, 1 + finalY * 0.008);
  bisShadow.setAttribute('rx', (118 * shadowScale).toFixed(1));

  // Ondulação articulada viva de cada um dos 8 tentáculos!
  const waveSpeed = (state.isSleeping ? 1.8 : 4.5) + spring.excitement * 5;
  const waveAmp = (state.isSleeping ? 2 : 6.5) + spring.excitement * 6 + (state.isDancing ? 6 : 0);

  tentacleGroups.forEach((g) => {
    const idx = Number(g.dataset.index || 0);
    const phase = idx * 0.75;
    const angle = Math.sin(t * waveSpeed + phase) * waveAmp;
    const lift = Math.cos(t * waveSpeed + phase) * (waveAmp * 0.65);
    g.setAttribute('transform', `translate(0, ${lift.toFixed(2)}) rotate(${angle.toFixed(2)} 190 195)`);
  });

  requestAnimationFrame(animateBisLoop);
}
requestAnimationFrame(animateBisLoop);

// ================= NAVEGAÇÃO ENTRE CÔMODOS =================
function goToRoom(index) {
  const total = ROOMS.length;
  const dir = index > state.roomIndex ? 1 : -1;
  state.roomIndex = (index + total) % total;
  rootStyle.setProperty('--room-index', state.roomIndex);

  roomTitleEl.textContent = ROOMS[state.roomIndex].title;

  dockPanels.forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.dock) === state.roomIndex);
  });

  if (state.roomIndex !== 2) {
    stopPlayAnimations();
  }
  if (state.roomIndex !== 3 && state.isSleeping) {
    toggleSleep(false);
  }

  // Impulso elástico ao deslizar de sala
  impulseBis({ sx: 1.12, sy: 0.9, vy: -6, tilt: dir * -7, excite: 0.9 });
}

function stopPlayAnimations() {
  state.isDancing = false;
  state.isPlayingBall = false;
  bouncingBall.classList.remove('active');
}

function updateHUD() {
  const setBar = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = `${Math.max(8, Math.min(100, val))}%`;
    if (val < 30) el.style.background = '#fb7185';
    else if (val < 60) el.style.background = '#facc15';
    else el.style.background = '#4ade80';
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

function spawnParticle(symbol) {
  const el = document.createElement('div');
  el.className = 'fx-particle';
  el.textContent = symbol;
  el.style.left = `${100 + Math.random() * 140}px`;
  el.style.top = `${60 + Math.random() * 70}px`;
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

// ================= AÇÕES POR SALA =================

// 0. COZINHA
document.querySelectorAll('[data-action="feed"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const foodEmoji = btn.dataset.food;
    const hungerGain = Number(btn.dataset.hunger || 15);
    const funGain = Number(btn.dataset.fun || 5);
    const coinGain = Number(btn.dataset.coins || 5);

    // Anima mastigação elástica
    mouthEat.setAttribute('rx', '15');
    mouthEat.setAttribute('ry', '12');
    setTimeout(() => {
      mouthEat.setAttribute('rx', '0');
      mouthEat.setAttribute('ry', '0');
    }, 360);

    state.hunger = Math.min(100, state.hunger + hungerGain);
    state.fun = Math.min(100, state.fun + funGain);
    state.coins += coinGain;

    impulseBis({ sx: 1.22, sy: 0.8, vy: -14, tilt: (Math.random() - 0.5) * 12, excite: 1.5 });
    blinkEyes(320);
    spawnParticle(foodEmoji);
    setTimeout(() => spawnParticle('💜'), 160);
    updateHUD();
  });
});

// 1. BANHEIRO
document.getElementById('btn-soap').addEventListener('click', () => {
  state.hasSoap = true;
  impulseBis({ sx: 1.16, sy: 0.86, vy: -8, excite: 1.2 });
  for (let i = 0; i < 15; i++) {
    const b = document.createElement('div');
    b.className = 'soap-bubble';
    const size = 18 + Math.random() * 26;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${85 + Math.random() * 165}px`;
    b.style.top = `${70 + Math.random() * 145}px`;
    foamContainer.appendChild(b);
  }
  spawnParticle('🫧');
});

document.getElementById('btn-shower').addEventListener('click', () => {
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      drop.style.left = `${105 + Math.random() * 130}px`;
      drop.style.top = `30px`;
      fxLayer.appendChild(drop);
      setTimeout(() => drop.remove(), 500);
    }, i * 32);
  }

  setTimeout(() => {
    foamContainer.innerHTML = '';
    state.hasSoap = false;
    state.clean = 100;
    state.coins += 8;
    impulseBis({ sx: 0.88, sy: 1.18, vy: -15, excite: 1.8 });
    blinkEyes(360);
    spawnParticle('✨');
    updateHUD();
  }, 420);
});

document.getElementById('btn-brush').addEventListener('click', () => {
  state.clean = Math.min(100, state.clean + 20);
  state.fun = Math.min(100, state.fun + 12);
  impulseBis({ sx: 1.2, sy: 0.82, vy: -12, tilt: 10, excite: 1.5 });
  spawnParticle('🦆');
  spawnParticle('🫧');
  updateHUD();
});

// 2. SALA DE JOGOS
document.getElementById('btn-ball').addEventListener('click', () => {
  state.isPlayingBall = !state.isPlayingBall;
  bouncingBall.classList.toggle('active', state.isPlayingBall);
  if (state.isPlayingBall) {
    state.fun = Math.min(100, state.fun + 16);
    state.energy = Math.max(0, state.energy - 6);
    state.coins += 10;
    impulseBis({ sx: 1.2, sy: 0.8, vy: -16, excite: 1.6 });
    spawnParticle('⚽');
    updateHUD();
  }
});

document.getElementById('btn-dance').addEventListener('click', () => {
  state.isDancing = !state.isDancing;
  if (state.isDancing) {
    state.fun = Math.min(100, state.fun + 18);
    state.energy = Math.max(0, state.energy - 8);
    state.coins += 12;
    impulseBis({ excite: 2.2 });
    spawnParticle('🎵');
    setTimeout(() => spawnParticle('🎶'), 220);
    updateHUD();
  }
});

document.getElementById('btn-tickle').addEventListener('click', () => {
  state.fun = Math.min(100, state.fun + 14);
  state.coins += 6;
  impulseBis({ sx: 1.25, sy: 0.78, vy: -18, tilt: -14, excite: 2.4 });
  blinkEyes(420);
  spawnParticle('😆');
  spawnParticle('💜');
  updateHUD();
});

// 3. QUARTO
function toggleSleep(forceState = null) {
  state.isSleeping = forceState !== null ? forceState : !state.isSleeping;
  document.body.classList.toggle('is-sleeping', state.isSleeping);

  const iconEl = document.getElementById('sleep-btn-icon');
  if (state.isSleeping) {
    eyesOpen.style.display = 'none';
    eyesClosed.style.display = 'block';
    iconEl.textContent = '☀️';
    state.energy = Math.min(100, state.energy + 30);
    spawnParticle('💤');
  } else {
    eyesOpen.style.display = 'block';
    eyesClosed.style.display = 'none';
    iconEl.textContent = '💡';
    impulseBis({ sx: 0.9, sy: 1.15, vy: -10, excite: 1.0 });
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

// 4. CLOSET
document.getElementById('color-swatches').addEventListener('click', (e) => {
  const sw = e.target.closest('.color-drop');
  if (!sw) return;
  document.querySelectorAll('.color-drop').forEach((s) => s.classList.remove('active'));
  sw.classList.add('active');
  state.colors = {
    hi: sw.dataset.hi,
    main: sw.dataset.main,
    sh: sw.dataset.sh,
  };
  impulseBis({ sx: 1.2, sy: 0.82, vy: -12, excite: 1.4 });
  spawnParticle('✨');
  updateHUD();
});

document.getElementById('accessory-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.free-acc');
  if (!btn || btn.id === 'btn-random-bis') return;
  document.querySelectorAll('#accessory-buttons .free-acc').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.accessory = btn.dataset.acc;
  impulseBis({ sx: 0.88, sy: 1.16, vy: -14, excite: 1.3 });
  spawnParticle('💜');
  updateHUD();
});

bisNameInput.addEventListener('input', (e) => {
  state.name = e.target.value.trim() || 'Bis';
  updateHUD();
});

document.getElementById('btn-random-bis').addEventListener('click', () => {
  const swatches = Array.from(document.querySelectorAll('.color-drop'));
  const accs = Array.from(document.querySelectorAll('#accessory-buttons .free-acc[data-acc]'));
  swatches[Math.floor(Math.random() * swatches.length)].click();
  accs[Math.floor(Math.random() * accs.length)].click();
});

// Clique direto no Bis (muito mais expressivo e elástico!)
bisWrapper.addEventListener('click', () => {
  if (state.isSleeping) {
    spawnParticle('💤');
    return;
  }
  state.fun = Math.min(100, state.fun + 5);
  impulseBis({
    sx: 1.24,
    sy: 0.78,
    vy: -16,
    tilt: (Math.random() - 0.5) * 18,
    excite: 2.0,
  });
  blinkEyes(280);
  spawnParticle('💜');
  updateHUD();
});

// ================= CONTROLES DE DESLIZE HORIZONTAL =================
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
    if (Math.abs(delta) < 16) return;

    wheelCooldown = true;
    if (delta > 0) goToRoom(state.roomIndex + 1);
    else goToRoom(state.roomIndex - 1);

    setTimeout(() => {
      wheelCooldown = false;
    }, 450);
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
  if (Math.abs(diffX) > 50) {
    if (diffX < 0) goToRoom(state.roomIndex + 1);
    else goToRoom(state.roomIndex - 1);
  }
});

// Olhos expressivos seguindo o dedo / cursor
window.addEventListener('pointermove', (e) => {
  if (state.isSleeping) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = Math.max(-5.5, Math.min(5.5, (e.clientX - cx) / 38));
  const dy = Math.max(-4.5, Math.min(4.5, (e.clientY - cy) / 38));

  pupilLeft.setAttribute('transform', `translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`);
  pupilRight.setAttribute('transform', `translate(${dx.toFixed(1)}, ${dy.toFixed(1)})`);
});

setInterval(() => {
  if (!state.isSleeping && Math.random() < 0.7) {
    blinkEyes(160);
  }
  if (state.isSleeping) {
    spawnParticle('💤');
    state.energy = Math.min(100, state.energy + 4);
    updateHUD();
  }
}, 3200);

function saveState() {
  try {
    localStorage.setItem('bis-pou-save-v4', JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('bis-pou-save-v4');
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed, { isSleeping: false, isDancing: false, isPlayingBall: false });
      bisNameInput.value = state.name;
    }
  } catch (_) {}
}

loadState();
goToRoom(state.roomIndex);
updateHUD();
