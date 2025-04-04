import { Trader } from "../../interface/trader";
import { MockAuthorize } from "./mockAuthorize";
import { ChildOrder } from "../childOrder";
import { GetChildOrders } from "../getChildOrders";
import { TechnicalWarriorTrader } from "../../trader/character/technicalWarriorTrader";
import { TrendHunterTrader } from "../../trader/character/trendHunterTrader";
import { GameManager } from "../../trader/character/gameManager";

export class MockTraderFactory {
    public static createTrader(traderName: string): Trader {
        const auth = new MockAuthorize();
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
        const auth = new MockAuthorize();
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
