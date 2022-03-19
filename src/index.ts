import { GetBalance } from "./getBalance";
import { Authorize } from "./authorize";
import { ChildOrder } from "./childOrder";

class Main {
  key = 'XXXX'
  secret = 'XXXX';

  constructor() {
    const auth = new Authorize(this.key, this.secret);
    // const balance = new GetBalance();
    const childorder = new ChildOrder();
    // ServerAPIの関数を実行
    // const bal = auth.init(balance.path, balance.method);
    // const options = auth.init(balance.path, balance.method);
    const options = auth.init(childorder.path, childorder.method, childorder.body);
    // const options = auth.init(balance.path, balance.method);

    const request = auth.request(options);
  }
}

new Main();