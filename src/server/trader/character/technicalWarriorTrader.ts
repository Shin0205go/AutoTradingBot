import { BaseCharacterTrader, CharacterAttributes } from "./baseCharacterTrader";
import { Authorize, Options } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";

export class TechnicalWarriorTrader extends BaseCharacterTrader {
    private shortTermMA: number = 5; // Short-term moving average period
    private longTermMA: number = 20; // Long-term moving average period
    private rsiPeriod: number = 14; // RSI calculation period
    private rsiOverbought: number = 70; // RSI overbought threshold
    private rsiOversold: number = 30; // RSI oversold threshold
    
    private priceHistory: number[] = [];
    
    constructor(auth: Authorize, childOrder: ChildOrder, getChildOrders: GetChildOrders) {
        super(
            auth, 
            childOrder, 
            getChildOrders, 
            "テクニカルウォリアー", 
            "移動平均線やRSIなどのテクニカル指標を使用して取引を行う戦士。トレンドを見極める目を持つ。"
        );
        
        this.attributes.specialAbilityThreshold = 0.08; // 8% profit triggers special ability
    }
    
    initCondition(): Options & { body?: string } {
        const action = this.analyzeTechnicals();
        
        this.childOrder.body.side = action;
        this.childOrder.body.child_order_type = "MARKET";
        this.childOrder.body.size = 0.001 * (1 + (this.attributes.level * 0.1)); // Size increases with level
        
        return this.auth.initPost(this.childOrder.path, this.childOrder.method, this.childOrder.body);
    }
    
    private analyzeTechnicals(): "BUY" | "SELL" {
        
        const latestPrice = this.simulateMarketPrice();
        this.priceHistory.push(latestPrice);
        
        if (this.priceHistory.length > this.longTermMA) {
            this.priceHistory = this.priceHistory.slice(-this.longTermMA);
        }
        
        if (this.priceHistory.length < this.longTermMA) {
            return Math.random() > 0.5 ? "BUY" : "SELL"; // Random decision until we have enough data
        }
        
        const shortTermAvg = this.calculateMA(this.shortTermMA);
        
        const longTermAvg = this.calculateMA(this.longTermMA);
        
        const rsi = this.calculateRSI();
        
        if (shortTermAvg > longTermAvg && rsi < this.rsiOverbought) {
            return "BUY";
        } else if (shortTermAvg < longTermAvg && rsi > this.rsiOversold) {
            return "SELL";
        } else if (rsi > this.rsiOverbought) {
            return "SELL";
        } else if (rsi < this.rsiOversold) {
            return "BUY";
        }
        
        return shortTermAvg > longTermAvg ? "BUY" : "SELL";
    }
    
    private calculateMA(period: number): number {
        if (this.priceHistory.length < period) {
            return 0;
        }
        
        const relevantPrices = this.priceHistory.slice(-period);
        const sum = relevantPrices.reduce((total, price) => total + price, 0);
        return sum / period;
    }
    
    private calculateRSI(): number {
        if (this.priceHistory.length < this.rsiPeriod + 1) {
            return 50; // Default neutral value
        }
        
        let gains = 0;
        let losses = 0;
        
        for (let i = this.priceHistory.length - this.rsiPeriod; i < this.priceHistory.length; i++) {
            const change = this.priceHistory[i] - this.priceHistory[i - 1];
            if (change >= 0) {
                gains += change;
            } else {
                losses -= change; // Make losses positive
            }
        }
        
        const avgGain = gains / this.rsiPeriod;
        const avgLoss = losses / this.rsiPeriod;
        
        if (avgLoss === 0) {
            return 100; // No losses means RSI = 100
        }
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    private simulateMarketPrice(): number {
        const basePrice = 5000000;
        
        const randomFactor = (Math.random() - 0.5) * 100000;
        
        let trendFactor = 0;
        if (this.priceHistory.length > 0) {
            const lastPrice = this.priceHistory[this.priceHistory.length - 1];
            const trendDirection = Math.random() > 0.3 ? 1 : -1; // 70% chance to continue trend
            trendFactor = (lastPrice - basePrice) * 0.8 * trendDirection;
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
                        .then((profit: number) => {
                            console.log(`${this.attributes.name}の取引完了! 利益: ${profit}円`);
                            resolve(profit);
                        })
                        .catch((err: Error) => {
                            console.error(`${this.attributes.name}の利益計算中にエラー: ${err}`);
                            reject(err);
                        });
                } else {
                    console.log(`${this.attributes.name}の注文が受け付けられませんでした。`);
                    resolve(0);
                }
            }).catch((err: Error) => {
                console.error(`${this.attributes.name}の注文中にエラー: ${err}`);
                reject(err);
            });
        });
    }
    
    specialAbility(): void {
        console.log(`${this.attributes.name}の特殊能力「ダブルダウン」が発動しました！`);
        
        const originalSize = this.childOrder.body.size;
        this.childOrder.body.size *= 2;
        
        console.log(`取引サイズが${originalSize}から${this.childOrder.body.size}に増加しました！`);
        
        setTimeout(() => {
            this.childOrder.body.size = originalSize;
            console.log(`${this.attributes.name}の特殊能力の効果が切れました。取引サイズが元に戻ります。`);
        }, 60000); // Effect lasts for 1 minute
    }
    
    protected improveAbilities(): void {
        if (this.attributes.level % 3 === 0) { // Every 3 levels
            this.shortTermMA = Math.max(3, this.shortTermMA - 1); // Shorter short-term MA (more responsive)
            console.log(`${this.attributes.name}の短期移動平均線が改善されました: ${this.shortTermMA}期間`);
        }
        
        if (this.attributes.level % 5 === 0) { // Every 5 levels
            this.rsiOverbought += 2; // More aggressive with overbought threshold
            this.rsiOversold -= 2; // More aggressive with oversold threshold
            console.log(`${this.attributes.name}のRSI感度が向上しました: 買われすぎ=${this.rsiOverbought}, 売られすぎ=${this.rsiOversold}`);
        }
    }
}
