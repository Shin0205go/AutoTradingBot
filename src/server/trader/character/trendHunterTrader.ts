import { BaseCharacterTrader } from "./baseCharacterTrader";
import { Authorize, Options } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";

export class TrendHunterTrader extends BaseCharacterTrader {
    private trendMemory: number = 10; // How many price points to remember
    private trendThreshold: number = 0.005; // 0.5% change to confirm trend
    private confidenceThreshold: number = 0.7; // 70% confidence to make a trade
    
    private priceHistory: number[] = [];
    private currentTrend: "UP" | "DOWN" | "NEUTRAL" = "NEUTRAL";
    private trendConfidence: number = 0;
    
    constructor(auth: Authorize, childOrder: ChildOrder, getChildOrders: GetChildOrders) {
        super(
            auth, 
            childOrder, 
            getChildOrders, 
            "トレンドハンター", 
            "市場のトレンドを追いかけ、流れに乗って取引を行う狩人。トレンドの変化を素早く察知する。"
        );
        
        this.attributes.specialAbilityThreshold = 0.1; // 10% profit triggers special ability
    }
    
    initCondition(): Options & { body?: string } {
        const action = this.analyzeTrend();
        
        this.childOrder.body.side = action;
        this.childOrder.body.child_order_type = "MARKET";
        this.childOrder.body.size = 0.001 * (1 + (this.attributes.level * 0.05)); // Size increases with level
        
        return this.auth.initPost(this.childOrder.path, this.childOrder.method, this.childOrder.body);
    }
    
    private analyzeTrend(): "BUY" | "SELL" {
        
        const latestPrice = this.simulateMarketPrice();
        this.priceHistory.push(latestPrice);
        
        if (this.priceHistory.length > this.trendMemory) {
            this.priceHistory = this.priceHistory.slice(-this.trendMemory);
        }
        
        if (this.priceHistory.length < 3) {
            return Math.random() > 0.5 ? "BUY" : "SELL"; // Random decision until we have enough data
        }
        
        this.calculateTrend();
        
        if (this.currentTrend === "UP" && this.trendConfidence > this.confidenceThreshold) {
            return "BUY";
        } else if (this.currentTrend === "DOWN" && this.trendConfidence > this.confidenceThreshold) {
            return "SELL";
        }
        
        if (this.currentTrend === "UP") {
            return Math.random() > 0.3 ? "BUY" : "SELL"; // 70% chance to follow trend
        } else if (this.currentTrend === "DOWN") {
            return Math.random() > 0.3 ? "SELL" : "BUY"; // 70% chance to follow trend
        }
        
        return Math.random() > 0.45 ? "BUY" : "SELL";
    }
    
    private calculateTrend(): void {
        if (this.priceHistory.length < 3) {
            this.currentTrend = "NEUTRAL";
            this.trendConfidence = 0;
            return;
        }
        
        const changes: number[] = [];
        for (let i = 1; i < this.priceHistory.length; i++) {
            const percentChange = (this.priceHistory[i] - this.priceHistory[i-1]) / this.priceHistory[i-1];
            changes.push(percentChange);
        }
        
        const positiveChanges = changes.filter(change => change > this.trendThreshold).length;
        const negativeChanges = changes.filter(change => change < -this.trendThreshold).length;
        const neutralChanges = changes.length - positiveChanges - negativeChanges;
        
        if (positiveChanges > negativeChanges + neutralChanges) {
            this.currentTrend = "UP";
            this.trendConfidence = positiveChanges / changes.length;
        } else if (negativeChanges > positiveChanges + neutralChanges) {
            this.currentTrend = "DOWN";
            this.trendConfidence = negativeChanges / changes.length;
        } else {
            this.currentTrend = "NEUTRAL";
            this.trendConfidence = 0.5; // Neutral confidence
        }
        
        console.log(`${this.attributes.name}のトレンド分析: ${this.currentTrend} (信頼度: ${(this.trendConfidence * 100).toFixed(1)}%)`);
    }
    
    private simulateMarketPrice(): number {
        const basePrice = 5000000;
        
        const randomFactor = (Math.random() - 0.5) * 100000;
        
        let trendFactor = 0;
        if (this.priceHistory.length > 0) {
            const lastPrice = this.priceHistory[this.priceHistory.length - 1];
            const trendDirection = Math.random() > 0.2 ? 1 : -1; // 80% chance to continue trend
            trendFactor = (lastPrice - basePrice) * 0.9 * trendDirection;
        }
        
        return basePrice + randomFactor + trendFactor;
    }
    
    trade(): any {
        console.log(`${this.attributes.name} (Lv.${this.attributes.level}) が取引を開始します...`);
        
        return new Promise((resolve, reject) => {
            const childOrderOption = this.initCondition();
            
            this.auth.request(childOrderOption).then((resText: any) => {
                console.log(`${this.attributes.name}の${this.childOrder.body.side}注文結果: ${JSON.stringify(resText)}`);
                
                const obj = JSON.parse(JSON.stringify(resText));
                
                if (obj && obj.child_order_acceptance_id) {
                    this.calcProfit(obj.child_order_acceptance_id)
                        .then(profit => {
                            console.log(`${this.attributes.name}の取引完了! 利益: ${profit}円`);
                            resolve(profit);
                        })
                        .catch(err => {
                            console.error(`${this.attributes.name}の利益計算中にエラー: ${err}`);
                            reject(err);
                        });
                } else {
                    console.log(`${this.attributes.name}の注文が受け付けられませんでした。`);
                    resolve(0);
                }
            }).catch(err => {
                console.error(`${this.attributes.name}の注文中にエラー: ${err}`);
                reject(err);
            });
        });
    }
    
    specialAbility(): void {
        console.log(`${this.attributes.name}の特殊能力「トレンドアンプリファイア」が発動しました！`);
        
        const originalSize = this.childOrder.body.size;
        const amplifier = 1 + this.trendConfidence;
        this.childOrder.body.size *= amplifier;
        
        console.log(`トレンド信頼度: ${(this.trendConfidence * 100).toFixed(1)}%`);
        console.log(`取引サイズが${originalSize}から${this.childOrder.body.size}に増加しました！`);
        
        setTimeout(() => {
            this.childOrder.body.size = originalSize;
            console.log(`${this.attributes.name}の特殊能力の効果が切れました。取引サイズが元に戻ります。`);
        }, 60000); // Effect lasts for 1 minute
    }
    
    protected improveAbilities(): void {
        if (this.attributes.level % 2 === 0) { // Every 2 levels
            this.trendMemory += 2; // Remember more price points
            console.log(`${this.attributes.name}のトレンドメモリが向上しました: ${this.trendMemory}ポイント`);
        }
        
        if (this.attributes.level % 3 === 0) { // Every 3 levels
            this.trendThreshold *= 0.9; // More sensitive to trend changes
            console.log(`${this.attributes.name}のトレンド感度が向上しました: ${(this.trendThreshold * 100).toFixed(2)}%`);
        }
        
        if (this.attributes.level % 5 === 0) { // Every 5 levels
            this.confidenceThreshold -= 0.05; // Can trade with less confidence
            console.log(`${this.attributes.name}の判断力が向上しました: 信頼度閾値=${(this.confidenceThreshold * 100).toFixed(0)}%`);
        }
    }
}
