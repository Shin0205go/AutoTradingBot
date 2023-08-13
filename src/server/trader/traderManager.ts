import { OneHalfTrader } from "./oneHalfTrader";
import { Trader } from "../interface/trader";
import { Authorize } from "../api/authorize";
import { ChildOrder } from "../api/childOrder";
import { GetChildOrders } from "../api/getChildOrders";
import { TraderFactory } from "./traderFactory";

class TraderManager {
    private traders: { [key: string]: Trader } = {};
    
    // トレーダーを追加
    addTrader(name: string, trader: Trader): void {
        this.traders[name] = trader;
    }

    // 指定した名前のトレーダーを取得
    getTrader(name: string): Trader | undefined {
        return this.traders[name];
    }

    // ユーザーの指示や市況に応じてトレーダーを選択
    selectTrader(criteria: any): Trader | undefined {
        // ここにトレーダーを選択するロジックを追加
        // 例えば、criteriaに基づいて最適なトレーダーを返す
        // TraderFactory側に条件を付与しているので、その条件をここで決めるとか。
        return TraderFactory.create();
    }

    selectTraderBasedOnMarketCondition(marketData: any): Trader | undefined {
        // 市況データを解析して、最適なトレーダーを選択するロジック
        // 例えば、特定の条件を満たす場合、特定のトレーダーを返す
        return TraderFactory.create();
    }
}
