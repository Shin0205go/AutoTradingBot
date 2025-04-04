import { Trader } from "../../interface/trader";
import { Authorize } from "../../api/authorize";
import { ChildOrder } from "../../api/childOrder";
import { GetChildOrders } from "../../api/getChildOrders";
import { GetBalance } from "../../api/getBalance";
import { TechnicalWarriorTrader } from "./technicalWarriorTrader";
import { TrendHunterTrader } from "./trendHunterTrader";
import { GameManager } from "./gameManager";
import fs from "fs";
import path from "path";

export class CharacterTraderFactory {
    static path = require('path');
    static filePath: string = path.join(__dirname, '../..', 'secret', 'secret.json');
    private static readonly secretData = JSON.parse(fs.readFileSync(CharacterTraderFactory.filePath, 'utf8'));
    public static readonly key: string = CharacterTraderFactory.secretData.key;
    public static readonly secret: string = CharacterTraderFactory.secretData.secret;
    
    public static createTrader(traderName: string): Trader {
        const auth = new Authorize(this.key, this.secret);
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
        const auth = new Authorize(this.key, this.secret);
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
