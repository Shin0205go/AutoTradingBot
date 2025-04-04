import { MockTraderFactory } from "./mockTraderFactory";
import { GameManager } from "../../trader/character/gameManager";

export class MockGameMain {
    private gameManager: GameManager;
    
    constructor() {
        this.gameManager = MockTraderFactory.createGameManager();
        console.log("モックトレーディングゲームシステムを初期化しました。");
    }
    
    async start(): Promise<void> {
        console.log("=== モックオートトレーディングバトルゲーム ===");
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
            
            console.log(`\n=== モックバトル: ${trader1} vs ${trader2} ===`);
            const battleResult = this.gameManager.battle(trader1, trader2);
            
            if (battleResult) {
                battleResult.battleLog.forEach(log => console.log(log));
            }
        }
        
        console.log("\n=== モックテスト完了 ===");
        console.log("実際の取引所に接続せずにゲームシステムをテストしました。");
    }
    
    getGameManager(): GameManager {
        return this.gameManager;
    }
}
