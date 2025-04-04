import express from 'express';
import path from 'path';
import { CharacterTraderFactory } from '../trader/character/characterTraderFactory';
import { GameManager } from '../trader/character/gameManager';

const router = express.Router();

router.get('/characters', (req, res) => {
    try {
        const availableTraders = CharacterTraderFactory.getAvailableTraders();
        
        const characters = availableTraders.map((traderName, index) => {
            return {
                id: `trader-${index + 1}`,
                name: traderName,
                description: getCharacterDescription(traderName),
                level: Math.floor(Math.random() * 5) + 1, // Mock level
                winRate: Math.floor(Math.random() * 30) + 50, // Mock win rate between 50-80%
                totalProfit: Math.floor(Math.random() * 300000), // Mock profit
                specialAbility: getSpecialAbility(traderName),
                tradingStyle: getTradingStyle(traderName)
            };
        });
        
        res.json(characters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
});

router.get('/leaderboard', (req, res) => {
    try {
        const auth = new (require('../api/mock/mockAuthorize').MockAuthorize)();
        const childOrder = new (require('../api/childOrder').ChildOrder)();
        const getChildOrders = new (require('../api/getChildOrders').GetChildOrders)();
        
        const gameManager = new GameManager(auth, childOrder, getChildOrders);
        const leaderboardData = gameManager.getLeaderboard();
        
        res.json(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
});

router.post('/select-character', (req, res) => {
    try {
        const { characterId } = req.body;
        
        if (!characterId) {
            return res.status(400).json({ error: 'Character ID is required' });
        }
        
        
        res.json({ success: true, message: 'Character selected successfully' });
    } catch (error) {
        console.error('Error selecting character:', error);
        res.status(500).json({ error: 'Failed to select character' });
    }
});

router.post('/start-battle', (req, res) => {
    try {
        const { characterId, opponentId } = req.body;
        
        if (!characterId || !opponentId) {
            return res.status(400).json({ error: 'Character ID and opponent ID are required' });
        }
        
        
        const battleResult = {
            rounds: [
                {
                    characterProfit: Math.floor(Math.random() * 50000) - 10000,
                    opponentProfit: Math.floor(Math.random() * 50000) - 10000,
                    winner: Math.random() > 0.5 ? 'character' : 'opponent'
                },
                {
                    characterProfit: Math.floor(Math.random() * 50000) - 10000,
                    opponentProfit: Math.floor(Math.random() * 50000) - 10000,
                    winner: Math.random() > 0.5 ? 'character' : 'opponent'
                },
                {
                    characterProfit: Math.floor(Math.random() * 50000) - 10000,
                    opponentProfit: Math.floor(Math.random() * 50000) - 10000,
                    winner: Math.random() > 0.5 ? 'character' : 'opponent'
                }
            ],
            winner: Math.random() > 0.5 ? 'character' : 'opponent',
            specialAbilityActivated: Math.random() > 0.7
        };
        
        res.json(battleResult);
    } catch (error) {
        console.error('Error starting battle:', error);
        res.status(500).json({ error: 'Failed to start battle' });
    }
});

function getCharacterDescription(traderName: string): string {
    const descriptions: { [key: string]: string } = {
        'テクニカルウォリアー': '移動平均線やRSIなどのテクニカル指標を使用して取引を行う戦士。トレンドを見極める目を持つ。',
        'トレンドハンター': '市場のトレンドを追いかけ、流れに乗って取引を行う狩人。トレンドの変化を素早く察知する。'
    };
    
    return descriptions[traderName] || '説明がありません';
}

function getSpecialAbility(traderName: string): string {
    const abilities: { [key: string]: string } = {
        'テクニカルウォリアー': 'ダブルダウン: 一定時間取引サイズを2倍にする',
        'トレンドハンター': 'トレンドアンプリファイア: トレンド信頼度に応じて取引サイズを増加'
    };
    
    return abilities[traderName] || '特殊能力はまだ解放されていません';
}

function getTradingStyle(traderName: string): string {
    const styles: { [key: string]: string } = {
        'テクニカルウォリアー': 'テクニカル分析重視',
        'トレンドハンター': 'トレンドフォロー'
    };
    
    return styles[traderName] || '不明';
}

export default router;
