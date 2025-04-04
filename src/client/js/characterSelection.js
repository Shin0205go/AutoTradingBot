
const characterListEl = document.getElementById('character-list');
const characterDetailsEl = document.getElementById('character-details');
const selectedCharacterInfoEl = document.getElementById('selected-character-info');
const selectCharacterBtn = document.getElementById('select-character-btn');
const startBattleBtn = document.getElementById('start-battle-btn');
const leaderboardBodyEl = document.getElementById('leaderboard-body');
const battleArenaEl = document.getElementById('battle-arena');
const traderLeftEl = document.getElementById('trader-left');
const traderRightEl = document.getElementById('trader-right');
const battleLogEl = document.getElementById('battle-log');
const closeBattleBtn = document.getElementById('close-battle-btn');

let characters = [];
let selectedCharacterId = null;
let leaderboard = [];
let battleInProgress = false;

const API_BASE_URL = '/api';
const ENDPOINTS = {
    CHARACTERS: `${API_BASE_URL}/characters`,
    SELECT_CHARACTER: `${API_BASE_URL}/select-character`,
    LEADERBOARD: `${API_BASE_URL}/leaderboard`,
    START_BATTLE: `${API_BASE_URL}/start-battle`,
};

const CHARACTER_ICONS = {
    'テクニカルウォリアー': '📊',
    'トレンドハンター': '🔍',
};

async function init() {
    try {
        await fetchCharacters();
        await fetchLeaderboard();
        setupEventListeners();
    } catch (error) {
        console.error('アプリケーションの初期化中にエラーが発生しました:', error);
        showErrorMessage('アプリケーションの読み込み中にエラーが発生しました。ページを更新してください。');
    }
}

async function fetchCharacters() {
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            characters = getMockCharacters();
            renderCharacterList();
            return;
        }
        
        const response = await fetch(ENDPOINTS.CHARACTERS);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        characters = await response.json();
        renderCharacterList();
    } catch (error) {
        console.error('キャラクター情報の取得中にエラーが発生しました:', error);
        showErrorMessage('キャラクター情報を読み込めませんでした。');
        
        characters = getMockCharacters();
        renderCharacterList();
    }
}

async function fetchLeaderboard() {
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            leaderboard = getMockLeaderboard();
            renderLeaderboard();
            return;
        }
        
        const response = await fetch(ENDPOINTS.LEADERBOARD);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        leaderboard = await response.json();
        renderLeaderboard();
    } catch (error) {
        console.error('リーダーボードデータの取得中にエラーが発生しました:', error);
        
        leaderboard = getMockLeaderboard();
        renderLeaderboard();
    }
}

function renderCharacterList() {
    characterListEl.innerHTML = '';
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = character.id;
        
        if (selectedCharacterId === character.id) {
            card.classList.add('selected');
        }
        
        const icon = CHARACTER_ICONS[character.name] || '👤';
        
        card.innerHTML = `
            <div class="character-icon">${icon}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-level">レベル ${character.level}</div>
            <div class="character-stats">
                <span>勝率: ${character.winRate}%</span>
                <span>利益: ${formatCurrency(character.totalProfit)}</span>
            </div>
        `;
        
        card.addEventListener('click', () => selectCharacter(character.id));
        characterListEl.appendChild(card);
    });
}

function selectCharacter(characterId) {
    selectedCharacterId = characterId;
    
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === characterId) {
            card.classList.add('selected');
        }
    });
    
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    renderCharacterDetails(character);
    
    selectCharacterBtn.disabled = false;
    startBattleBtn.disabled = false;
}

function renderCharacterDetails(character) {
    const icon = CHARACTER_ICONS[character.name] || '👤';
    
    selectedCharacterInfoEl.innerHTML = `
        <div class="character-header">
            <div class="character-icon large">${icon}</div>
            <div>
                <h3>${character.name}</h3>
                <div class="character-level">レベル ${character.level}</div>
            </div>
        </div>
        
        <div class="character-attribute">
            <div class="character-attribute-name">説明</div>
            <div class="character-attribute-value">${character.description}</div>
        </div>
        
        <div class="character-attribute">
            <div class="character-attribute-name">特殊能力</div>
            <div class="character-attribute-value">${character.specialAbility || '特殊能力はまだ解放されていません'}</div>
        </div>
        
        <div class="character-attribute">
            <div class="character-attribute-name">戦績</div>
            <div class="character-attribute-value">
                勝率: ${character.winRate}% | 総利益: ${formatCurrency(character.totalProfit)}
            </div>
        </div>
        
        <div class="character-attribute">
            <div class="character-attribute-name">取引スタイル</div>
            <div class="character-attribute-value">${character.tradingStyle || '不明'}</div>
        </div>
    `;
}

function renderLeaderboard() {
    leaderboardBodyEl.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.level}</td>
            <td>${entry.winRate}%</td>
            <td>${formatCurrency(entry.totalProfit)}</td>
        `;
        
        leaderboardBodyEl.appendChild(row);
    });
}

async function startBattle() {
    if (!selectedCharacterId || battleInProgress) return;
    
    battleInProgress = true;
    battleArenaEl.classList.remove('hidden');
    
    const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
    const opponents = characters.filter(c => c.id !== selectedCharacterId);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    traderLeftEl.innerHTML = createTraderBattleHTML(selectedCharacter);
    traderRightEl.innerHTML = createTraderBattleHTML(opponent);
    battleLogEl.innerHTML = '';
    
    await simulateBattle(selectedCharacter, opponent);
    
    battleInProgress = false;
}

function createTraderBattleHTML(character) {
    const icon = CHARACTER_ICONS[character.name] || '👤';
    
    return `
        <div class="battle-trader-icon">${icon}</div>
        <div class="battle-trader-name">${character.name}</div>
        <div class="battle-trader-level">レベル ${character.level}</div>
        <div class="battle-trader-stats">
            <div>勝率: ${character.winRate}%</div>
            <div>総利益: ${formatCurrency(character.totalProfit)}</div>
        </div>
    `;
}

async function simulateBattle(trader1, trader2) {
    addBattleLogEntry(`バトル開始: ${trader1.name} vs ${trader2.name}`);
    
    const rounds = 3;
    let trader1Score = 0;
    let trader2Score = 0;
    
    for (let i = 1; i <= rounds; i++) {
        addBattleLogEntry(`ラウンド ${i} 開始...`, false);
        
        await delay(1000);
        
        const trader1Profit = Math.floor(Math.random() * 50000) - 10000;
        const trader2Profit = Math.floor(Math.random() * 50000) - 10000;
        
        addBattleLogEntry(`${trader1.name}の取引結果: ${formatCurrency(trader1Profit)}`, false);
        addBattleLogEntry(`${trader2.name}の取引結果: ${formatCurrency(trader2Profit)}`, false);
        
        if (trader1Profit > trader2Profit) {
            trader1Score++;
            addBattleLogEntry(`ラウンド ${i} の勝者: ${trader1.name}!`, true);
        } else if (trader2Profit > trader1Profit) {
            trader2Score++;
            addBattleLogEntry(`ラウンド ${i} の勝者: ${trader2.name}!`, true);
        } else {
            addBattleLogEntry(`ラウンド ${i} は引き分けです!`, true);
        }
        
        if (Math.random() > 0.7) {
            const activatingTrader = Math.random() > 0.5 ? trader1 : trader2;
            addBattleLogEntry(`${activatingTrader.name}の特殊能力が発動しました!`, true);
        }
        
        await delay(1500);
    }
    
    let winner;
    if (trader1Score > trader2Score) {
        winner = trader1;
    } else if (trader2Score > trader1Score) {
        winner = trader2;
    }
    
    if (winner) {
        addBattleLogEntry(`バトル終了! 勝者は ${winner.name} です!`, true);
    } else {
        addBattleLogEntry(`バトル終了! 引き分けです!`, true);
    }
}

function addBattleLogEntry(text, highlight = false) {
    const entry = document.createElement('div');
    entry.className = 'battle-log-entry';
    if (highlight) {
        entry.classList.add('highlight');
    }
    entry.textContent = text;
    battleLogEl.appendChild(entry);
    battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

function setupEventListeners() {
    selectCharacterBtn.addEventListener('click', async () => {
        if (!selectedCharacterId) return;
        
        try {
            alert(`${characters.find(c => c.id === selectedCharacterId).name}を選択しました！`);
        } catch (error) {
            console.error('キャラクター選択中にエラーが発生しました:', error);
            showErrorMessage('キャラクターを選択できませんでした。もう一度お試しください。');
        }
    });
    
    startBattleBtn.addEventListener('click', startBattle);
    
    closeBattleBtn.addEventListener('click', () => {
        battleArenaEl.classList.add('hidden');
        battleInProgress = false;
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', { 
        style: 'currency', 
        currency: 'JPY',
        maximumFractionDigits: 0
    }).format(amount);
}

function showErrorMessage(message) {
    alert(message);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getMockCharacters() {
    return [
        {
            id: 'tech-warrior',
            name: 'テクニカルウォリアー',
            description: '移動平均線やRSIなどのテクニカル指標を使用して取引を行う戦士。トレンドを見極める目を持つ。',
            level: 5,
            winRate: 68,
            totalProfit: 250000,
            specialAbility: 'ダブルダウン: 一定時間取引サイズを2倍にする',
            tradingStyle: 'テクニカル分析重視'
        },
        {
            id: 'trend-hunter',
            name: 'トレンドハンター',
            description: '市場のトレンドを追いかけ、流れに乗って取引を行う狩人。トレンドの変化を素早く察知する。',
            level: 4,
            winRate: 72,
            totalProfit: 180000,
            specialAbility: 'トレンドアンプリファイア: トレンド信頼度に応じて取引サイズを増加',
            tradingStyle: 'トレンドフォロー'
        }
    ];
}

function getMockLeaderboard() {
    return [
        {
            name: 'トレンドハンター',
            level: 4,
            winRate: 72,
            totalProfit: 180000
        },
        {
            name: 'テクニカルウォリアー',
            level: 5,
            winRate: 68,
            totalProfit: 250000
        }
    ];
}

document.addEventListener('DOMContentLoaded', init);
