import { BaseCharacterTrader, CharacterAttributes } from "./baseCharacterTrader";
import { TechnicalWarriorTrader } from "./technicalWarriorTrader";
import { TrendHunterTrader } from "./trendHunterTrader";
import { Authorize } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";

export interface LeaderboardEntry {
    name: string;
    level: number;
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    rank: number;
}

export class GameManager {
    private traders: { [key: string]: BaseCharacterTrader } = {};
    private leaderboard: LeaderboardEntry[] = [];
    private auth: Authorize;
    private childOrder: ChildOrder;
    private getChildOrders: GetChildOrders;
    
    constructor(auth: Authorize, childOrder: ChildOrder, getChildOrders: GetChildOrders) {
        this.auth = auth;
        this.childOrder = childOrder;
        this.getChildOrders = getChildOrders;
        
        this.initializeTraders();
    }
    
    private initializeTraders(): void {
        const technicalWarrior = new TechnicalWarriorTrader(
            this.auth,
            new ChildOrder(), // Each trader gets its own ChildOrder instance
            this.getChildOrders
        );
        this.traders[technicalWarrior.getAttributes().name] = technicalWarrior;
        
        const trendHunter = new TrendHunterTrader(
            this.auth,
            new ChildOrder(), // Each trader gets its own ChildOrder instance
            this.getChildOrders
        );
        this.traders[trendHunter.getAttributes().name] = trendHunter;
        
        
        this.updateLeaderboard();
    }
    
    getAvailableTraders(): string[] {
        return Object.keys(this.traders);
    }
    
    getTrader(name: string): BaseCharacterTrader | undefined {
        return this.traders[name];
    }
    
    getAllTraders(): { [key: string]: BaseCharacterTrader } {
        return { ...this.traders };
    }
    
    updateLeaderboard(): LeaderboardEntry[] {
        const entries: LeaderboardEntry[] = Object.values(this.traders).map(trader => {
            const attributes = trader.getAttributes();
            return {
                name: attributes.name,
                level: attributes.level,
                totalProfit: attributes.totalProfit,
                winRate: attributes.winRate,
                totalTrades: attributes.totalTrades,
                rank: 0 // Will be set below
            };
        });
        
        entries.sort((a, b) => b.totalProfit - a.totalProfit);
        
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        this.leaderboard = entries;
        return this.leaderboard;
    }
    
    getLeaderboard(): LeaderboardEntry[] {
        return [...this.leaderboard];
    }
    
    battle(trader1Name: string, trader2Name: string): {
        winner: string;
        profitDifference: number;
        battleLog: string[];
    } | null {
        const trader1 = this.traders[trader1Name];
        const trader2 = this.traders[trader2Name];
        
        if (!trader1 || !trader2) {
            console.error("トレーダーが見つかりません。");
            return null;
        }
        
        return trader1.battle(trader2);
    }
    
    async tradeAll(): Promise<void> {
        console.log("全トレーダーの取引を開始します...");
        
        for (const traderName of Object.keys(this.traders)) {
            const trader = this.traders[traderName];
            console.log(`${traderName}の取引を実行中...`);
            
            try {
                await trader.trade();
            } catch (error) {
                console.error(`${traderName}の取引中にエラーが発生しました: ${error}`);
            }
        }
        
        this.updateLeaderboard();
        console.log("全トレーダーの取引が完了しました。");
        this.displayLeaderboard();
    }
    
    displayLeaderboard(): void {
        console.log("\n===== トレーダーリーダーボード =====");
        console.log("順位 | トレーダー名 | レベル | 総利益 | 勝率 | 取引回数");
        console.log("----------------------------------------");
        
        this.leaderboard.forEach(entry => {
            console.log(
                `${entry.rank}位 | ${entry.name} | Lv.${entry.level} | ${entry.totalProfit.toFixed(0)}円 | ${(entry.winRate * 100).toFixed(1)}% | ${entry.totalTrades}回`
            );
        });
        
        console.log("==============================\n");
    }
    
    getCharacterDetails(traderName: string): CharacterAttributes | null {
        const trader = this.traders[traderName];
        if (!trader) {
            return null;
        }
        
        return trader.getAttributes();
    }
}
