import { CharacterTraderFactory } from "./characterTraderFactory";
import { GameManager } from "./gameManager";

export class GameMain {
    private gameManager: GameManager;
    
    constructor() {
        this.gameManager = CharacterTraderFactory.createGameManager();
        console.log("トレーディングゲームシステムを初期化しました。");
    }
    
    async start(): Promise<void> {
        console.log("=== オートトレーディングバトルゲーム ===");
        console.log("利用可能なトレーダーキャラクター:");
        
        const availableTraders = this.gameManager.getAvailableTraders();
        availableTraders.forEach((traderName, index) => {
            const details = this.gameManager.getCharacterDetails(traderName);
            if (details) {
                console.log(`${index + 1}. ${details.name} - ${details.description}`);
            }
        });
        
        this.gameManager.displayLeaderboard();
        
        await this.gameManager.tradeAll();
        
        this.gameManager.displayLeaderboard();
        
        const leaderboard = this.gameManager.getLeaderboard();
        if (leaderboard.length >= 2) {
            const trader1 = leaderboard[0].name;
            const trader2 = leaderboard[1].name;
            
            console.log(`\n=== バトル: ${trader1} vs ${trader2} ===`);
            const battleResult = this.gameManager.battle(trader1, trader2);
            
            if (battleResult) {
                battleResult.battleLog.forEach(log => console.log(log));
            }
        }
    }
    
    getGameManager(): GameManager {
        return this.gameManager;
    }
    
    selectTrader(traderName: string) {
        const trader = this.gameManager.getTrader(traderName);
        if (trader) {
            console.log(`${traderName}を選択しました。`);
            return trader;
        } else {
            console.error(`トレーダー "${traderName}" が見つかりません。`);
            return null;
        }
    }
}
