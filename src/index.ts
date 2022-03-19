import { GetBalance } from "./getBalance";
import { Authorize } from "./authorize";
import { ChildOrder } from "./childOrder";
import { SSL_OP_EPHEMERAL_RSA } from "constants";
import { threadId } from "worker_threads";

export class Main {
  key = 'XXX'
  secret = 'XXX';
  childorder: ChildOrder;
  auth: Authorize;
  balance: GetBalance;
  constructor() {
    this.auth = new Authorize(this.key, this.secret);
    this.balance = new GetBalance();
    this.childorder = new ChildOrder();
  }

}

const main = new Main();
const getbalance = main.auth.init(main.balance.path, main.balance.method);
var childorder = main.auth.init(main.childorder.path, main.childorder.method, main.childorder.body);
// 資産状況
//main.auth.request(getbalance);

var n = 1;
(async () => {
  console.log('スタート');
  for (var i = 0; i < 100; i++) {
    var num = Math.floor(Math.random() * 2) + 1;
    var pricerandom = Math.random();
    if (num == 1) {
      main.childorder.body.side = "SELL";
    } else {
      main.childorder.body.side = "BUY";
    }
    main.childorder.body.child_order_type = "MARKET"
    //売り注文に変わるつもり
    childorder = main.auth.init(main.childorder.path, main.childorder.method, main.childorder.body);
    await new Promise(resolve => setTimeout(resolve, 180000))
    // 注文
    main.auth.request(childorder);

    console.log(n + "回目の注文は、" + main.childorder.body.side + "注文")
    n++;
  }
})();

