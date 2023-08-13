import { Trader } from "../interface/trader";
import { Authorize, Options } from "../api/authorize";
import { ChildOrder } from "../api/childOrder";
import { GetChildOrders } from "../api/getChildOrders";
import { GetBalance } from "../api/getBalance";

export class SampleTrader implements Trader {
    auth: Authorize;
    childOrder: ChildOrder;
    getChildOrders: GetChildOrders;
    getBalance: GetBalance = new GetBalance();

    constructor(auth: Authorize, childOrder: ChildOrder, getChildOrders: GetChildOrders) {
        this.auth = auth;
        this.childOrder = childOrder;
        this.getChildOrders = getChildOrders;
    }

    initCondition(): Options & { body?: string } {
        // ここで条件を初期化するロジックを実装
        // 例: return { path: 'somePath', method: 'POST', body: 'someBody' };

            this.childOrder.body.child_order_type = "MARKET"
            return this.auth.initPost(this.childOrder.path, this.childOrder.method, this.childOrder.body);
        }

    calcProfit(childOrderId: string): any {
        // ここで利益を計算するロジックを実装
        childOrderId = "hoge";
        console.log("hoge");
    }

    trade() {
        // ここで取引のロジックを実装
        console.log('test');
        this.calcProfit('hote')
    }

}