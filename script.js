const questBoard = document.getElementById('quest-board');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close-btn');

let currentQuestIdToComplete = null;
let currentXP = 1200;

let mockQuests = [
    { id: 1, title: "Santuário do Conhecimento", desc: "Estudar 1 hora para a aula de Mobile da Fatec.", xp: 100, icon: "📚" },
    { id: 2, title: "Treino do Bárbaro", desc: "Completar o treino do dia na Smart Fit.", xp: 80, icon: "🏋️" },
    { id: 3, title: "Derrotar o Dragão da Louça", desc: "Lavar toda a louça do jantar sem usar o celular.", xp: 50, icon: "🐉" }
];

// Lottie JSON configurado
const sampleLottieJSON = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
  v: "5.5.7", fr: 60, ip: 0, op: 60, w: 100, h: 100, nm: "Check",
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Checkmark", sr: 1, ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }
    },
    shapes: [{
      ty: "grp", items: [
        { ty: "sh", ks: { a: 0, k: { i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0]], v: [[-20, 0], [-5, 15], [20, -10]], c: false } } },
        { ty: "st", c: { a: 0, k: [0.73, 0.52, 0.98, 1] }, w: { a: 0, k: 7 }, lc: 2, lj: 2 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]
    }]
  }]
}));

let lottieAnimation = null;
if (typeof lottie !== 'undefined') {
  lottieAnimation = lottie.loadAnimation({
    container: document.getElementById('lottie-container'),
    renderer: 'svg', loop: false, autoplay: false, path: sampleLottieJSON
  });
}

// 1. Renderiza Skeletons
function renderSkeletons() {
    questBoard.innerHTML = '';
    for(let i = 0; i < 3; i++) {
        questBoard.innerHTML += `
            <div class="card">
                <div class="skeleton-wrapper">
                    <div class="skeleton skeleton-icon"></div>
                    <div class="skeleton-content">
                        <div class="skeleton skeleton-line"></div>
                        <div class="skeleton skeleton-line short"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// 2. Renderiza Dados Reais
function renderRealData() {
    questBoard.innerHTML = ''; 

    if (mockQuests.length === 0) {
        questBoard.innerHTML = '<p style="text-align:center; color:#888; margin-top:40px;">Todas as missões foram concluídas! 🏆</p>';
        return;
    }
    
    mockQuests.forEach(quest => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `quest-${quest.id}`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-main">
                    <span class="quest-icon">${quest.icon}</span>
                    <div class="quest-info">
                        <h3>${quest.title}</h3>
                        <p>${quest.desc}</p>
                        <span class="reward">+${quest.xp} XP / Moedas</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-action" onclick="openCompleteModal(${quest.id})" title="Concluir Missão">✅</button>
                    <button class="btn-action" onclick="toggleSwipeBox(${quest.id})" title="Excluir Missão">🗑️</button>
                </div>
            </div>

            <div class="swipe-confirm-box" id="swipe-box-${quest.id}">
                <div class="swipe-track" id="track-${quest.id}">
                    <span class="swipe-text" id="text-${quest.id}">⏩ Arraste para excluir</span>
                    <div class="swipe-thumb" id="thumb-${quest.id}">➡️</div>
                </div>
            </div>
        `;

        questBoard.appendChild(card);
        setupSwipeEvents(quest.id);
    });
}

// Abre o Modal com Animação Motion + Lottie
function openCompleteModal(questId) {
    currentQuestIdToComplete = questId;
    const quest = mockQuests.find(q => q.id === questId);
    if(quest) {
        document.getElementById('modal-reward').innerText = `+${quest.xp} XP | +${quest.xp / 2} Moedas`;
    }

    overlay.classList.add('active');

    if (typeof Motion !== 'undefined') {
        Motion.animate(overlay, { opacity: [0, 1] }, { duration: 0.2 });
        Motion.animate(modal, { transform: ['translateY(30px) scale(0.9)', 'translateY(0px) scale(1)'] }, { duration: 0.3, easing: [0.175, 0.885, 0.32, 1.275] });
    }

    if (lottieAnimation) {
        lottieAnimation.goToAndPlay(0, true);
    }
}

// Fecha o Modal e remove a missão concluída
closeBtn.addEventListener('click', () => {
    if (typeof Motion !== 'undefined') {
        Motion.animate(overlay, { opacity: [1, 0] }, { duration: 0.2 }).finished.then(closeModalAction);
    } else {
        closeModalAction();
    }
});

function closeModalAction() {
    overlay.classList.remove('active');
    if (currentQuestIdToComplete !== null) {
        const quest = mockQuests.find(q => q.id === currentQuestIdToComplete);
        if (quest) {
            currentXP += quest.xp;
            document.getElementById('player-xp').innerText = `Nível 5 | ${currentXP} XP`;
        }
        deleteQuest(currentQuestIdToComplete);
        currentQuestIdToComplete = null;
    }
}

function toggleSwipeBox(questId) {
    const swipeBox = document.getElementById(`swipe-box-${questId}`);
    swipeBox.classList.toggle('active');
}

function setupSwipeEvents(questId) {
    const track = document.getElementById(`track-${questId}`);
    const thumb = document.getElementById(`thumb-${questId}`);
    const text = document.getElementById(`text-${questId}`);
    let isDragging = false, startX = 0, currentX = 0;

    function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

    function onStart(e) {
        isDragging = true; startX = getX(e); thumb.style.transition = 'none';
    }

    function onMove(e) {
        if (!isDragging) return;
        const maxDrag = track.clientWidth - thumb.clientWidth - 4;
        let diff = getX(e) - startX;
        if (diff < 0) diff = 0;
        if (diff > maxDrag) diff = maxDrag;
        currentX = diff;
        thumb.style.transform = `translateX(${currentX}px)`;
        text.style.opacity = (1 - (currentX / maxDrag)).toString();
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        const maxDrag = track.clientWidth - thumb.clientWidth - 4;
        if (currentX / maxDrag >= 0.85) {
            thumb.style.transform = `translateX(${maxDrag}px)`;
            deleteQuest(questId);
        } else {
            thumb.style.transition = 'transform 0.3s ease';
            thumb.style.transform = 'translateX(0px)';
            text.style.opacity = '1';
            currentX = 0;
        }
    }

    thumb.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    thumb.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
}

function deleteQuest(questId) {
    const card = document.getElementById(`quest-${questId}`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
            mockQuests = mockQuests.filter(q => q.id !== questId);
            renderRealData();
        }, 300);
    }
}

// Inicialização: Skeletons -> 3 segundos -> Dados Reais
renderSkeletons();
setTimeout(renderRealData, 3000);
