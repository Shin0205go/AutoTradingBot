
const characterListEl = document.getElementById('character-list');
const characterDetailsEl = document.getElementById('character-details');
const selectedCharacterInfoEl = document.getElementById('selected-character-info');
const selectCharacterBtn = document.getElementById('select-character-btn');
const startTradingBtn = document.getElementById('start-trading-btn');
const leaderboardBodyEl = document.getElementById('leaderboard-body');
const tradingSimulatorEl = document.getElementById('trading-simulator');
const traderInfoEl = document.getElementById('trader-info');
const levelBarEl = document.getElementById('level-bar');
const levelInfoEl = document.getElementById('level-info');
const tradingLogEl = document.getElementById('trading-log');
const simulateTradeBtn = document.getElementById('simulate-trade-btn');
const closeTradingBtn = document.getElementById('close-trading-btn');

let characters = [];
let selectedCharacterId = null;
let leaderboard = [];
let tradingInProgress = false;
let currentCharacter = null;
let currentLevel = 1;
let currentXP = 0;
let xpToNextLevel = 1000;

const API_BASE_URL = '/api';
const ENDPOINTS = {
    CHARACTERS: `${API_BASE_URL}/characters`,
    SELECT_CHARACTER: `${API_BASE_URL}/select-character`,
    LEADERBOARD: `${API_BASE_URL}/leaderboard`,
    SIMULATE_TRADE: `${API_BASE_URL}/simulate-trade`,
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
    startTradingBtn.disabled = false;
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

async function startTrading() {
    if (!selectedCharacterId || tradingInProgress) return;
    
    tradingInProgress = true;
    tradingSimulatorEl.classList.remove('hidden');
    
    currentCharacter = characters.find(c => c.id === selectedCharacterId);
    if (!currentCharacter) return;
    
    currentLevel = currentCharacter.level || 1;
    currentXP = 0;
    xpToNextLevel = currentLevel * 1000;
    
    updateTraderInfo();
    
    updateLevelBar();
    
    tradingLogEl.innerHTML = '';
    
    addTradingLogEntry(`${currentCharacter.name}のトレードシミュレーションを開始します。`, true);
    await delay(1000);
    addTradingLogEntry(`現在のレベル: ${currentLevel}`, false);
    await delay(500);
    addTradingLogEntry(`次のレベルまでに必要な経験値: ${xpToNextLevel}XP`, false);
    await delay(500);
    addTradingLogEntry(`トレードを開始するには「トレードシミュレーション」ボタンをクリックしてください。`, true);
}

function updateTraderInfo() {
    const icon = CHARACTER_ICONS[currentCharacter.name] || '👤';
    
    traderInfoEl.innerHTML = `
        <div class="trader-icon">${icon}</div>
        <div class="trader-name">${currentCharacter.name}</div>
        <div class="trader-level">レベル ${currentLevel}</div>
        <div class="trader-stats">
            <div>取引スタイル: ${currentCharacter.tradingStyle || '不明'}</div>
            <div>特殊能力: ${currentCharacter.specialAbility || 'なし'}</div>
        </div>
    `;
}

function updateLevelBar() {
    const percentage = Math.min((currentXP / xpToNextLevel) * 100, 100);
    levelBarEl.style.width = `${percentage}%`;
    levelInfoEl.textContent = `レベル ${currentLevel} (${currentXP}/${xpToNextLevel} XP)`;
}

async function simulateTrade() {
    if (!currentCharacter || !tradingInProgress) return;
    
    addTradingLogEntry(`トレードシミュレーション実行中...`, false);
    await delay(1000);
    
    const baseAmount = 10000 + (currentLevel * 5000);
    const volatility = 0.8;
    const profit = Math.floor(baseAmount * (1 + ((Math.random() * 2 - 1) * volatility)));
    
    const specialAbilityChance = 0.1 + (currentLevel * 0.05);
    const specialAbilityActivated = Math.random() < specialAbilityChance;
    
    let finalProfit = profit;
    if (specialAbilityActivated) {
        const bonusMultiplier = 1.5;
        finalProfit = Math.floor(profit * bonusMultiplier);
        await delay(800);
        addTradingLogEntry(`${currentCharacter.name}の特殊能力が発動しました！`, true);
        await delay(500);
    }
    
    const isProfitable = finalProfit > 0;
    const resultClass = isProfitable ? 'profit' : 'loss';
    
    await delay(800);
    addTradingLogEntry(`トレード結果: ${formatCurrency(finalProfit)}`, false, resultClass);
    
    let xpGained = 0;
    if (isProfitable) {
        xpGained = Math.floor(finalProfit / 100); // 利益100円ごとに1XP
        await delay(800);
        addTradingLogEntry(`+${xpGained} XP獲得！`, true, 'profit');
    } else {
        xpGained = Math.floor(Math.abs(finalProfit) / 500); // 損失500円ごとに1XP
        await delay(800);
        addTradingLogEntry(`+${xpGained} XP獲得！（失敗からの学び）`, false);
    }
    
    currentXP += xpGained;
    
    if (currentXP >= xpToNextLevel) {
        await levelUp();
    }
    
    updateLevelBar();
}

async function levelUp() {
    currentXP -= xpToNextLevel;
    currentLevel++;
    xpToNextLevel = currentLevel * 1000; // レベルが上がるごとに必要XPが増加
    
    const levelUpNotification = document.createElement('div');
    levelUpNotification.className = 'level-up-notification';
    levelUpNotification.textContent = `レベルアップ！ ${currentCharacter.name}はレベル${currentLevel}になりました！`;
    
    tradingLogEl.appendChild(levelUpNotification);
    tradingLogEl.scrollTop = tradingLogEl.scrollHeight;
    
    await delay(1000);
    addTradingLogEntry(`レベルアップにより取引スキルが向上しました！`, true, 'profit');
    await delay(500);
    addTradingLogEntry(`次のレベルまでに必要な経験値: ${xpToNextLevel}XP`, false);
    
    updateTraderInfo();
    
}

function addTradingLogEntry(text, highlight = false, className = '') {
    const entry = document.createElement('div');
    entry.className = 'trading-log-entry';
    if (highlight) {
        entry.classList.add('highlight');
    }
    if (className) {
        entry.classList.add(className);
    }
    entry.textContent = text;
    tradingLogEl.appendChild(entry);
    tradingLogEl.scrollTop = tradingLogEl.scrollHeight;
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
    
    startTradingBtn.addEventListener('click', startTrading);
    
    simulateTradeBtn.addEventListener('click', simulateTrade);
    
    closeTradingBtn.addEventListener('click', () => {
        tradingSimulatorEl.classList.add('hidden');
        tradingInProgress = false;
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
