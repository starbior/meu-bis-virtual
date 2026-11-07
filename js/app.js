const state = {
  name: 'Bis',
  primaryColor: '#9333ea',
  secondaryColor: '#6b21a8',
  accessory: 'none',
  expression: 'happy',
  hunger: 85,
  happy: 90,
  energy: 80,
};

// Elementos do DOM
const displayName = document.getElementById('bis-display-name');
const inputName = document.getElementById('input-name');
const bisBody = document.getElementById('bis-body');
const bisTentacles = document.getElementById('bis-tentacles');
const bisBackTentacles = document.getElementById('bis-back-tentacles');
const bisAccessory = document.getElementById('bis-accessory');
const bisEyes = document.getElementById('bis-eyes');
const bisMouth = document.getElementById('bis-mouth');
const bisSvg = document.getElementById('bis-svg');
const floatingEffect = document.getElementById('floating-effect');
const moodTag = document.getElementById('bis-mood');
const saveFeedback = document.getElementById('save-feedback');

const accessoriesSVG = {
  none: '',
  crown: `<polygon points="95,68 105,45 120,60 135,45 145,68" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>`,
  bow: `<g transform="translate(120, 65)">
          <polygon points="-22,-10 0,0 -22,10" fill="#f43f5e"/>
          <polygon points="22,-10 0,0 22,10" fill="#f43f5e"/>
          <circle cx="0" cy="0" r="5" fill="#fb7185"/>
        </g>`,
  hat: `<g transform="translate(120, 62)">
          <rect x="-28" y="0" width="56" height="6" rx="3" fill="#1e293b"/>
          <rect x="-18" y="-28" width="36" height="28" rx="4" fill="#1e293b"/>
          <rect x="-18" y="-8" width="36" height="5" fill="#a855f7"/>
        </g>`,
  flower: `<g transform="translate(148, 72)">
            <circle cx="0" cy="-8" r="6" fill="#f472b6"/>
            <circle cx="8" cy="0" r="6" fill="#f472b6"/>
            <circle cx="0" cy="8" r="6" fill="#f472b6"/>
            <circle cx="-8" cy="0" r="6" fill="#f472b6"/>
            <circle cx="0" cy="0" r="5" fill="#fde047"/>
          </g>`,
};

function renderExpression(exp) {
  if (exp === 'happy') {
    bisEyes.innerHTML = `
      <circle cx="95" cy="120" r="12" fill="#1e1b4b" />
      <circle cx="91" cy="115" r="4.5" fill="#ffffff" />
      <circle cx="145" cy="120" r="12" fill="#1e1b4b" />
      <circle cx="141" cy="115" r="4.5" fill="#ffffff" />
    `;
    bisMouth.setAttribute('d', 'M110 134 Q120 145 130 134');
  } else if (exp === 'surprised') {
    bisEyes.innerHTML = `
      <circle cx="95" cy="120" r="13" fill="#1e1b4b" />
      <circle cx="91" cy="115" r="5" fill="#ffffff" />
      <circle cx="145" cy="120" r="13" fill="#1e1b4b" />
      <circle cx="141" cy="115" r="5" fill="#ffffff" />
    `;
    bisMouth.setAttribute('d', 'M115 136 A5 6 0 1 0 125 136 A5 6 0 1 0 115 136');
  } else if (exp === 'wink') {
    bisEyes.innerHTML = `
      <circle cx="95" cy="120" r="12" fill="#1e1b4b" />
      <circle cx="91" cy="115" r="4.5" fill="#ffffff" />
      <path d="M133 120 Q145 110 157 120" stroke="#1e1b4b" stroke-width="4" stroke-linecap="round" fill="none" />
    `;
    bisMouth.setAttribute('d', 'M110 134 Q122 146 132 132');
  } else if (exp === 'cool') {
    bisEyes.innerHTML = `
      <rect x="75" y="108" width="38" height="20" rx="4" fill="#0f172a" />
      <rect x="127" y="108" width="38" height="20" rx="4" fill="#0f172a" />
      <line x1="113" y1="114" x2="127" y2="114" stroke="#0f172a" stroke-width="4" />
      <line x1="80" y1="113" x2="92" y2="113" stroke="#38bdf8" stroke-width="2" />
      <line x1="132" y1="113" x2="144" y2="113" stroke="#38bdf8" stroke-width="2" />
    `;
    bisMouth.setAttribute('d', 'M112 136 Q122 142 132 133');
  }
}

function updateUI() {
  displayName.textContent = state.name || 'Bis';
  bisBody.setAttribute('fill', state.primaryColor);
  bisTentacles.setAttribute('fill', state.primaryColor);
  bisBackTentacles.setAttribute('fill', state.secondaryColor);
  bisAccessory.innerHTML = accessoriesSVG[state.accessory] || '';
  renderExpression(state.expression);

  document.getElementById('stat-hunger-val').textContent = `${state.hunger}%`;
  document.getElementById('bar-hunger').style.width = `${state.hunger}%`;

  document.getElementById('stat-happy-val').textContent = `${state.happy}%`;
  document.getElementById('bar-happy').style.width = `${state.happy}%`;

  document.getElementById('stat-energy-val').textContent = `${state.energy}%`;
  document.getElementById('bar-energy').style.width = `${state.energy}%`;

  const avg = (state.hunger + state.happy + state.energy) / 3;
  if (avg >= 75) moodTag.textContent = 'Radiante ✨';
  else if (avg >= 45) moodTag.textContent = 'Tranquilo 🐙';
  else moodTag.textContent = 'Carente 💜';
}

function triggerEffect(symbol) {
  floatingEffect.textContent = symbol;
  floatingEffect.classList.add('show');
  bisSvg.classList.remove('bounce');
  void bisSvg.offsetWidth;
  bisSvg.classList.add('bounce');

  setTimeout(() => {
    floatingEffect.classList.remove('show');
  }, 650);
}

// Eventos de Customização
inputName.addEventListener('input', (e) => {
  state.name = e.target.value.trim() || 'Bis';
  updateUI();
});

document.getElementById('color-options').addEventListener('click', (e) => {
  const btn = e.target.closest('.color-swatch');
  if (!btn) return;
  document.querySelectorAll('.color-swatch').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.primaryColor = btn.dataset.primary;
  state.secondaryColor = btn.dataset.secondary;
  updateUI();
});

document.getElementById('accessory-options').addEventListener('click', (e) => {
  const btn = e.target.closest('.pill-btn');
  if (!btn) return;
  document.querySelectorAll('#accessory-options .pill-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.accessory = btn.dataset.acc;
  updateUI();
});

document.getElementById('expression-options').addEventListener('click', (e) => {
  const btn = e.target.closest('.pill-btn');
  if (!btn) return;
  document.querySelectorAll('#expression-options .pill-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  state.expression = btn.dataset.exp;
  updateUI();
});

// Ações de cuidado
document.getElementById('btn-feed').addEventListener('click', () => {
  state.hunger = Math.min(100, state.hunger + 15);
  triggerEffect('🍤');
  updateUI();
});

document.getElementById('btn-play').addEventListener('click', () => {
  state.happy = Math.min(100, state.happy + 15);
  state.energy = Math.max(0, state.energy - 8);
  triggerEffect('🫧');
  updateUI();
});

document.getElementById('btn-sleep').addEventListener('click', () => {
  state.energy = Math.min(100, state.energy + 20);
  triggerEffect('💤');
  updateUI();
});

document.getElementById('aquarium').addEventListener('click', () => {
  state.happy = Math.min(100, state.happy + 5);
  triggerEffect('💜');
  updateUI();
});

// Botão Aleatório
document.getElementById('btn-random').addEventListener('click', () => {
  const swatches = Array.from(document.querySelectorAll('.color-swatch'));
  const accs = Array.from(document.querySelectorAll('#accessory-options .pill-btn'));
  const exps = Array.from(document.querySelectorAll('#expression-options .pill-btn'));

  swatches[Math.floor(Math.random() * swatches.length)].click();
  accs[Math.floor(Math.random() * accs.length)].click();
  exps[Math.floor(Math.random() * exps.length)].click();
  triggerEffect('🎲');
});

// Salvar no localStorage
document.getElementById('btn-save').addEventListener('click', () => {
  localStorage.setItem('meu-bis-save', JSON.stringify(state));
  saveFeedback.textContent = 'Bis salvo com sucesso! 🐙💜';
  setTimeout(() => {
    saveFeedback.textContent = '';
  }, 2500);
});

// Carregar save se existir
const saved = localStorage.getItem('meu-bis-save');
if (saved) {
  try {
    Object.assign(state, JSON.parse(saved));
    inputName.value = state.name;
  } catch (_) {}
}

updateUI();
