import { GetBalance } from "./getBalance";
import { Authorize } from "./authorize";
import { ChildOrder } from "./childOrder";
import { GetChildOrders } from "./getChildOrders";
import { OneHalfTrader } from "./oneHalfTrader";

export class Main {
  key = 'XXX'
  secret = 'XXX';
  childOrder: ChildOrder;
  auth: Authorize;
  balance: GetBalance;
  getChildOrders: GetChildOrders;
  constructor() {
    this.auth = new Authorize(this.key, this.secret);
    this.balance = new GetBalance();
    this.childOrder = new ChildOrder();
    this.getChildOrders = new GetChildOrders(this.auth);
  }

}

const main = new Main();
const getBalance = main.auth.initPost(main.balance.path, main.balance.method);
// 資産状況
// main.auth.request(getBalance).then((resText) => {
// console.log(resText);
// });

var oneHalfTrader = new OneHalfTrader(main.auth, main.childOrder, main.getChildOrders);
oneHalfTrader.trade();
//
// oneHalfTrader.calcProfit('JRF20220325-083323-143673');
