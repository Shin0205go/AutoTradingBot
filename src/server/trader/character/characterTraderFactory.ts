import { Trader } from "../../interface/trader";
import { Authorize } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";
import { GetBalance } from "../../api/getBalance";
import { TechnicalWarriorTrader } from "./technicalWarriorTrader";
import { TrendHunterTrader } from "./trendHunterTrader";
import { GameManager } from "./gameManager";

export class CharacterTraderFactory {
    private static readonly USE_MOCK = process.env.USE_MOCK === 'true' || false;
    
    public static createTrader(traderName: string): Trader {
        const auth = new Authorize(
            process.env.API_KEY || 'mock-key',
            process.env.API_SECRET || 'mock-secret'
        );
        
        const childOrder = new ChildOrder();
        const getChildOrders = new GetChildOrders(auth);
        
        switch (traderName) {
            case "テクニカルウォリアー":
                return new TechnicalWarriorTrader(auth, childOrder, getChildOrders);
            case "トレンドハンター":
                return new TrendHunterTrader(auth, childOrder, getChildOrders);
            default:
                console.log(`トレーダー "${traderName}" が見つかりません。デフォルトのテクニカルウォリアーを使用します。`);
                return new TechnicalWarriorTrader(auth, childOrder, getChildOrders);
        }
    }
    
    public static createGameManager(): GameManager {
        const auth = new Authorize(
            process.env.API_KEY || 'mock-key',
            process.env.API_SECRET || 'mock-secret'
        );
        
        const childOrder = new ChildOrder();
        const getChildOrders = new GetChildOrders(auth);
        
        return new GameManager(auth, childOrder, getChildOrders);
    }
    
    public static getAvailableTraders(): string[] {
        return [
            "テクニカルウォリアー",
            "トレンドハンター"
        ];
    }
}
