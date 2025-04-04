import { Trader } from "../../interface/trader";
import { Authorize, Options } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";
import { GetBalance } from "../../api/getBalance";

export interface CharacterAttributes {
    name: string;
    description: string;
    level: number;
    experience: number;
    winRate: number;
    totalTrades: number;
    successfulTrades: number;
    totalProfit: number;
    specialAbilityThreshold: number; // When this threshold is met, special ability can be used
}

export abstract class BaseCharacterTrader implements Trader {
    auth: Authorize;
    childOrder: ChildOrder;
    getChildOrders: GetChildOrders;
    getBalance: GetBalance = new GetBalance();
    
    protected attributes: CharacterAttributes;
    
    protected tradingHistory: {
        timestamp: Date;
        action: string;
        price: number;
        size: number;
        profit: number;
    }[] = [];
    
    constructor(
        auth: Authorize, 
        childOrder: ChildOrder, 
        getChildOrders: GetChildOrders,
        name: string,
        description: string
    ) {
        this.auth = auth;
        this.childOrder = childOrder;
        this.getChildOrders = getChildOrders;
        
        this.attributes = {
            name: name,
            description: description,
            level: 1,
            experience: 0,
            winRate: 0,
            totalTrades: 0,
            successfulTrades: 0,
            totalProfit: 0,
            specialAbilityThreshold: 0.05 // Default 5% profit triggers special ability
        };
    }
    
    abstract initCondition(): Options & { body?: string };
    abstract trade(): any;
    abstract specialAbility(): void; // Special ability that can be triggered under certain conditions
    
    calcProfit(childOrderId: string): any {
        let sumOfBuy = 0;
        let sumOfSell = 0;
        
        let calcProfitGetChildOrder = this.getChildOrders;
        if (calcProfitGetChildOrder.queryParameters.child_order_acceptance_id == undefined) {
            calcProfitGetChildOrder.queryParameters.child_order_acceptance_id = childOrderId;
        }
        
        return new Promise((resolve, reject) => {
            calcProfitGetChildOrder.getChildOrder().then((res) => {
                const obj1 = JSON.parse(JSON.stringify(res));
                
                this.getChildOrders.queryParameters.child_order_acceptance_id = obj1[0].child_order_acceptance_id;
                
                calcProfitGetChildOrder.getChildOrder().then((res) => {
                    const obj2 = JSON.parse(JSON.stringify(res));
                    
                    this.getChildOrders.queryParameters.after = obj2[0].id;
                    this.getChildOrders.queryParameters.child_order_acceptance_id = undefined;
                    this.getChildOrders.queryParameters.count = 100;
                    
                    calcProfitGetChildOrder.getChildOrder().then((res) => {
                        const obj = JSON.parse(JSON.stringify(res));
                        
                        for (let i in obj) {
                            if (obj[i].side == "BUY") {
                                let buy = obj[i].average_price * obj[i].size;
                                sumOfBuy += buy;
                            } else {
                                let sell = obj[i].average_price * obj[i].size;
                                sumOfSell += sell;
                            }
                        }
                        
                        const profit = sumOfSell - sumOfBuy;
                        console.log(`${this.attributes.name}の現在の利益は${profit}円です。`);
                        
                        this.updateCharacterStats(profit);
                        
                        if (this.canUseSpecialAbility()) {
                            this.specialAbility();
                        }
                        
                        resolve(profit);
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
    
    protected updateCharacterStats(profit: number): void {
        this.attributes.totalTrades++;
        
        this.attributes.totalProfit += profit;
        
        if (profit > 0) {
            this.attributes.successfulTrades++;
        }
        
        this.attributes.winRate = this.attributes.successfulTrades / this.attributes.totalTrades;
        
        this.gainExperience(Math.abs(profit) * 0.01); // Gain experience based on profit amount
        
        this.tradingHistory.push({
            timestamp: new Date(),
            action: this.childOrder.body.side,
            price: 0, // This would be updated with actual price
            size: this.childOrder.body.size,
            profit: profit
        });
    }
    
    protected gainExperience(amount: number): void {
        this.attributes.experience += amount;
        
        const experienceNeeded = 100 * this.attributes.level;
        if (this.attributes.experience >= experienceNeeded) {
            this.levelUp();
        }
    }
    
    protected levelUp(): void {
        this.attributes.level++;
        this.attributes.experience = 0; // Reset experience
        console.log(`${this.attributes.name}がレベルアップしました！現在のレベル: ${this.attributes.level}`);
        
        this.improveAbilities();
    }
    
    protected improveAbilities(): void {
    }
    
    protected canUseSpecialAbility(): boolean {
        return this.attributes.totalProfit > this.attributes.specialAbilityThreshold;
    }
    
    getAttributes(): CharacterAttributes {
        return { ...this.attributes };
    }
    
    getTradingHistory() {
        return [...this.tradingHistory];
    }
    
    battle(opponent: BaseCharacterTrader): {
        winner: string;
        profitDifference: number;
        battleLog: string[];
    } {
        const myProfit = this.attributes.totalProfit;
        const opponentProfit = opponent.attributes.totalProfit;
        const profitDifference = myProfit - opponentProfit;
        
        const battleLog = [
            `バトル開始: ${this.attributes.name} vs ${opponent.attributes.name}`,
            `${this.attributes.name} の総利益: ${myProfit}円`,
            `${opponent.attributes.name} の総利益: ${opponentProfit}円`,
        ];
        
        let winner;
        if (profitDifference > 0) {
            winner = this.attributes.name;
            battleLog.push(`${this.attributes.name} の勝利！ 利益差: ${profitDifference}円`);
        } else if (profitDifference < 0) {
            winner = opponent.attributes.name;
            battleLog.push(`${opponent.attributes.name} の勝利！ 利益差: ${Math.abs(profitDifference)}円`);
        } else {
            winner = "引き分け";
            battleLog.push("引き分け！両者の利益が同じです。");
        }
        
        return {
            winner,
            profitDifference: Math.abs(profitDifference),
            battleLog
        };
    }
}
