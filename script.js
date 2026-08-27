const questBoard = document.getElementById('quest-board');

// Lista inicial de missões simuladas
let mockQuests = [
    { id: 1, title: "Santuário do Conhecimento", desc: "Estudar 1 hora para a aula de Mobile da Fatec.", xp: 100, icon: "📚" },
    { id: 2, title: "Treino do Bárbaro", desc: "Completar o treino do dia na Smart Fit.", xp: 80, icon: "🏋️" },
    { id: 3, title: "Derrotar o Dragão da Louça", desc: "Lavar toda a louça do jantar sem usar o celular.", xp: 50, icon: "🐉" }
];

// REQUISITO 2: Função que renderiza os Skeleton Screens
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

// Renderiza os Cards Reais com opção de deleção
function renderRealData() {
    questBoard.innerHTML = ''; 

    if (mockQuests.length === 0) {
        questBoard.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">Todas as missões foram concluídas! 🏆</p>';
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
                <button class="btn-delete-trigger" onclick="toggleSwipeBox(${quest.id})" title="Excluir Missão">🗑️</button>
            </div>

            <div class="swipe-confirm-box" id="swipe-box-${quest.id}">
                <div class="swipe-track" id="track-${quest.id}">
                    <span class="swipe-text" id="text-${quest.id}">⏩ Arraste até o fim para excluir</span>
                    <div class="swipe-thumb" id="thumb-${quest.id}">➡️</div>
                </div>
            </div>
        `;

        questBoard.appendChild(card);
        
        // Inicializa os eventos de toque e arrasto do Swipe para este card
        setupSwipeEvents(quest.id);
    });
}

// Alterna a exibição da barra de confirmação do swipe
function toggleSwipeBox(questId) {
    const swipeBox = document.getElementById(`swipe-box-${questId}`);
    swipeBox.classList.toggle('active');
}

// REQUISITO 3: Implementação dos Eventos de Gesture (Touch / Mouse Drag)
function setupSwipeEvents(questId) {
    const track = document.getElementById(`track-${questId}`);
    const thumb = document.getElementById(`thumb-${questId}`);
    const text = document.getElementById(`text-${questId}`);
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    function getX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onStart(e) {
        isDragging = true;
        startX = getX(e);
        thumb.style.transition = 'none';
    }

    function onMove(e) {
        if (!isDragging) return;
        const x = getX(e);
        const maxDrag = track.clientWidth - thumb.clientWidth - 4;
        let diff = x - startX;

        if (diff < 0) diff = 0;
        if (diff > maxDrag) diff = maxDrag;

        currentX = diff;
        thumb.style.transform = `translateX(${currentX}px)`;

        // Esconde o texto suavemente à medida que o usuário arrasta
        const progress = currentX / maxDrag;
        text.style.opacity = (1 - progress).toString();
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;

        const maxDrag = track.clientWidth - thumb.clientWidth - 4;
        const progress = currentX / maxDrag;

        // Se arrastou mais de 85% do caminho, confirma a exclusão
        if (progress >= 0.85) {
            thumb.style.transform = `translateX(${maxDrag}px)`;
            deleteQuest(questId);
        } else {
            // Retorna ao início com animação suave se não chegou até o final
            thumb.style.transition = 'transform 0.3s ease';
            thumb.style.transform = 'translateX(0px)';
            text.style.opacity = '1';
            currentX = 0;
        }
    }

    // Eventos de Toque (Mobile)
    thumb.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    // Eventos de Mouse (Desktop)
    thumb.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
}

// Remove a missão da lista e atualiza a tela
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

// Fluxo de execução: Exibe Skeletons -> Aguarda 3 segundos -> Renderiza Dados
renderSkeletons();
setTimeout(renderRealData, 3000);
