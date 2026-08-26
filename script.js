const questBoard = document.getElementById('quest-board');

// Simulando o banco de dados das missões diárias
const mockQuests = [
    { id: 1, title: "Santuário do Conhecimento", desc: "Estudar 1 hora para a aula de Mobile da Fatec.", xp: 100, icon: "📚" },
    { id: 2, title: "Treino do Bárbaro", desc: "Completar o treino do dia na Smart Fit.", xp: 80, icon: "🏋️" },
    { id: 3, title: "Derrotar o Dragão da Louça", desc: "Lavar toda a louça do jantar sem usar o celular.", xp: 50, icon: "🐉" }
];

// Função 1: Mostra os retângulos cinzas pulsantes (Skeletons)
function renderSkeletons() {
    questBoard.innerHTML = '';
    for(let i = 0; i < 3; i++) {
        questBoard.innerHTML += `
            <div class="card">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton-content">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line short"></div>
                </div>
            </div>
        `;
    }
}

// Função 2: Mostra as missões reais com design de RPG
function renderRealData() {
    questBoard.innerHTML = ''; 
    
    mockQuests.forEach(quest => {
        questBoard.innerHTML += `
            <div class="card">
                <div class="quest-icon">${quest.icon}</div>
                <div class="quest-info">
                    <h3>${quest.title}</h3>
                    <p>${quest.desc}</p>
                    <span class="reward">+${quest.xp} XP / Moedas</span>
                </div>
            </div>
        `;
    });
}

// Execução: Mostra skeletons -> Espera 3 segundos -> Mostra dados
renderSkeletons();
setTimeout(renderRealData, 3000);
