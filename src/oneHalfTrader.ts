import { Trader } from "./trader";
import { Authorize, Options } from "./authorize";
import { ChildOrder } from "./childOrder";
import { GetChildOrders } from "./getChildOrders";

export class OneHalfTrader implements Trader {
    auth: Authorize;
    childOrder: ChildOrder;
    getChildOrders: GetChildOrders;
    half: number;

    constructor(auth: Authorize, childOrder: ChildOrder, getChildOrders: GetChildOrders) {
        this.auth = auth;
        this.childOrder = childOrder;
        this.getChildOrders = getChildOrders;
        this.half = this.oneHalf();
    }

    oneHalf(): number {
        return Math.floor(Math.random() * 2) + 1;
    }

    initCondition(): Options & { body?: string } {
        if (this.half == 1) {
            this.childOrder.body.side = "SELL";
        } else {
            this.childOrder.body.side = "BUY";
        }
        this.childOrder.body.child_order_type = "MARKET"
        return this.auth.initPost(this.childOrder.path, this.childOrder.method, this.childOrder.body);
    }

    //損益計算
    calcProfit(childOrderId: string) {
        let sumOfBuy = 0;
        let sumOfSell = 0;
        //1回目のリクエスト※回し始めた際の1回目の注文のid("JRF20150707-084552-031927"のような形式で取得される)を取得する。
        let calcProfitGetChildOrder = this.getChildOrders;
        if (calcProfitGetChildOrder.queryParameters.child_order_acceptance_id == undefined) {
            calcProfitGetChildOrder.queryParameters.child_order_acceptance_id = childOrderId;
        }
        calcProfitGetChildOrder.getChildOrder().then((res) => {
            const obj1 = JSON.parse(JSON.stringify(res))
            //COMPLETEDの注文番号を取得し、クエリパラメータにセットする。
            this.getChildOrders.queryParameters.child_order_acceptance_id = obj1[0].child_order_acceptance_id;
            // 2回目の確認　※該当のidを取得する
            calcProfitGetChildOrder.getChildOrder().then((res) => {
                const obj2 = JSON.parse(JSON.stringify(res))
                //1回目で取得した番号で一覧を取得し、IDをafterに入れる。次のリクエストではこの注文以降のリスト(計算対象)が取れるようになる。
                this.getChildOrders.queryParameters.after = obj2[0].id;
                this.getChildOrders.queryParameters.child_order_acceptance_id = undefined;
                this.getChildOrders.queryParameters.count = 100;
                calcProfitGetChildOrder.getChildOrder().then((res) => {
                    const obj = JSON.parse(JSON.stringify(res))
                    for (let i in obj) {
                        if (obj[i].side == "BUY") {
                            let buy = obj[i].average_price * obj[i].size;
                            sumOfBuy = buy++;
                        } else {
                            let sell = obj[i].average_price * obj[i].size;
                            sumOfSell = sell++;
                        }
                    }
                    const profit = sumOfSell - sumOfBuy;
                    console.log("現在の利益は" + profit + "円です。");
                    this.getChildOrders.queryParameters.child_order_acceptance_id = childOrderId;
                });
            });
        });
    }

    trade() {
        let n = 0;
        this.childOrder.body.size = 0.001;
        (async () => {
            console.log('スタート');
            for (let i = 0; i < 100; i++) { //TODO: forループをやめる。
                let id: string;
                this.half = this.oneHalf();
                let childOrderOption = this.initCondition();
                // 1分待つ;            
                await new Promise(resolve => setTimeout(resolve, 30000))
                // 注文
                this.auth.request(childOrderOption).then((resText: any) => {

                    // JSONをString変換して標準出力
                    console.log(n + "回目の注文は、" + this.childOrder.body.side + "注文" + "結果:" + JSON.parse(JSON.stringify(resText)))
                    const obj = JSON.parse(JSON.stringify(resText));
                    if (i == 0) {
                        id = obj[0].child_order_acceptance_id;
                    }
                    this.calcProfit("JRF20220408-124311-046963");
                })
                n++;
            }

            //{"child_order_acceptance_id":"JRF20220320-131629-154272"}
            // 注文の一覧を取得
            // let result = getChildOrder.getChild(child_order_acceptance_id);
            //　損益計算
            // this.calcProfit();
        })();
    };
}