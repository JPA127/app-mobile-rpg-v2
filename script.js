// ===== STATE =====
const state = {
  level: 1,
  xp: 0,
  maxXp: 100,
  coins: 0,
  totalXp: 0,
  completed: 0,
  spent: 0,
  missions: [
    {
      id: 1,
      title: "Estudar por 30 min",
      desc: "Foco total no conteúdo",
      diff: "easy",
      xp: 15,
      coins: 5,
      completed: false
    },
    {
      id: 2,
      title: "Finalizar relatório",
      desc: "Entregar antes do prazo",
      diff: "medium",
      xp: 35,
      coins: 12,
      completed: false
    },
    {
      id: 3,
      title: "Projeto pessoal",
      desc: "Avançar no side project",
      diff: "hard",
      xp: 60,
      coins: 25,
      completed: false
    }
  ],
  shop: [
    { id: 1, name: "Pausa de Café", desc: "15 min de descanso", icon: "☕", price: 10 },
    { id: 2, name: "Episódio Anime", desc: "Assistir 1 episódio", icon: "📺", price: 30 },
    { id: 3, name: "Jogar 1h", desc: "Tempo livre para jogar", icon: "🎮", price: 50 },
    { id: 4, name: "Dia de Folga", desc: "Um dia sem tarefas", icon: "🏖️", price: 200 }
  ]
};

// ===== RANKS =====
const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];

// ===== DIFFICULTY MAP =====
const diffMap = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  epic: 'Épico'
};

// ===== DOM ELEMENTS =====
const els = {
  level: document.getElementById('level'),
  currentXp: document.getElementById('currentXp'),
  maxXp: document.getElementById('maxXp'),
  xpFill: document.getElementById('xpFill'),
  coinCount: document.getElementById('coinCount'),
  missionsList: document.getElementById('missionsList'),
  shopList: document.getElementById('shopList'),
  completedCount: document.getElementById('completedCount'),
  totalXp: document.getElementById('totalXp'),
  spentCoins: document.getElementById('spentCoins'),
  profileRank: document.getElementById('profileRank'),
  modalOverlay: document.getElementById('modalOverlay'),
  missionTitle: document.getElementById('missionTitle'),
  missionDesc: document.getElementById('missionDesc'),
  missionDiff: document.getElementById('missionDiff'),
  missionXp: document.getElementById('missionXp'),
  toast: document.getElementById('toast'),
  fabBtn: document.getElementById('fabBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  createBtn: document.getElementById('createBtn')
};

// ===== RENDER =====
function render() {
  // Header
  els.level.textContent = state.level;
  els.currentXp.textContent = state.xp;
  els.maxXp.textContent = state.maxXp;
  els.xpFill.style.width = (state.xp / state.maxXp * 100) + '%';
  els.coinCount.textContent = state.coins;

  // Profile
  els.completedCount.textContent = state.completed;
  els.totalXp.textContent = state.totalXp;
  els.spentCoins.textContent = state.spent;
  els.profileRank.textContent = ranks[Math.min(state.level - 1, ranks.length - 1)] || 'E';

  // Missions
  const active = state.missions.filter(m => !m.completed);
  if (active.length === 0) {
    els.missionsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📜</div>
        <p>Nenhuma missão ativa. Crie uma nova!</p>
      </div>`;
  } else {
    els.missionsList.innerHTML = active.map(m => `
      <div class="mission-card ${m.diff}">
        <div class="mission-header">
          <span class="mission-title">${escapeHtml(m.title)}</span>
          <span class="mission-badge ${m.diff}">${diffMap[m.diff]}</span>
        </div>
        <p class="mission-desc">${escapeHtml(m.desc)}</p>
        <div class="mission-footer">
          <div class="mission-rewards">
            <span class="reward xp">⚡ ${m.xp} XP</span>
            <span class="reward coins">🪙 ${m.coins}</span>
          </div>
          <button class="btn-complete" data-id="${m.id}">Completar</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners to new buttons
    document.querySelectorAll('.btn-complete').forEach(btn => {
      btn.addEventListener('click', () => completeMission(parseInt(btn.dataset.id)));
    });
  }

  // Shop
  els.shopList.innerHTML = state.shop.map(item => `
    <div class="shop-item">
      <div class="shop-icon">${item.icon}</div>
      <div class="shop-info">
        <div class="shop-name">${escapeHtml(item.name)}</div>
        <div class="shop-desc">${escapeHtml(item.desc)}</div>
      </div>
      <div style="text-align:right">
        <div class="shop-price">🪙 ${item.price}</div>
        <button class="btn-buy" data-id="${item.id}" ${state.coins < item.price ? 'disabled' : ''}>Comprar</button>
      </div>
    </div>
  `).join('');

  // Attach event listeners to shop buttons
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => buyItem(parseInt(btn.dataset.id)));
  });
}

// ===== ACTIONS =====
function completeMission(id) {
  const m = state.missions.find(x => x.id === id);
  if (!m || m.completed) return;

  m.completed = true;
  state.xp += m.xp;
  state.totalXp += m.xp;
  state.coins += m.coins;
  state.completed++;

  // Level up loop
  while (state.xp >= state.maxXp) {
    state.xp -= state.maxXp;
    state.level++;
    state.maxXp = Math.floor(state.maxXp * 1.5);
    showToast(`🎉 LEVEL UP! Nível ${state.level}`);
    els.level.classList.add('level-up');
    setTimeout(() => els.level.classList.remove('level-up'), 600);
  }

  showToast(`✅ "${m.title}" completa! +${m.xp} XP, +${m.coins} 🪙`);
  render();
}

function buyItem(id) {
  const item = state.shop.find(x => x.id === id);
  if (!item || state.coins < item.price) return;

  state.coins -= item.price;
  state.spent += item.price;
  showToast(`🛒 ${item.name} comprado!`);
  render();
}

function addMission() {
  const title = els.missionTitle.value.trim();
  const desc = els.missionDesc.value.trim();
  const diff = els.missionDiff.value;
  let xp = parseInt(els.missionXp.value) || 25;

  if (!title) {
    showToast('⚠️ Digite um título!');
    return;
  }

  const coins = Math.floor(xp * 0.4);

  state.missions.push({
    id: Date.now(),
    title,
    desc: desc || `Missão de dificuldade ${diffMap[diff]}`,
    diff,
    xp,
    coins,
    completed: false
  });

  // Reset form
  els.missionTitle.value = '';
  els.missionDesc.value = '';
  els.missionXp.value = 25;
  els.missionDiff.value = 'medium';

  closeModal();
  showToast('⚔️ Missão criada!');
  render();
}

// ===== UI =====
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

function openModal() {
  els.modalOverlay.classList.add('active');
  els.missionTitle.focus();
}

function closeModal() {
  els.modalOverlay.classList.remove('active');
}

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== EVENT LISTENERS =====
// Tab navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// FAB
els.fabBtn.addEventListener('click', openModal);

// Modal buttons
els.cancelBtn.addEventListener('click', closeModal);
els.createBtn.addEventListener('click', addMission);

// Close modal on overlay click
els.modalOverlay.addEventListener('click', (e) => {
  if (e.target === els.modalOverlay) closeModal();
});

// Keyboard: Enter to submit modal
els.missionTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addMission();
});

// ===== INIT =====
render();
