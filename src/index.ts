import { GetBalance } from "./getBalance";

class Main {
  constructor() {
    // serverModuleの中のServerAPIクラスのインスタンスを作成
    const balance = new GetBalance();
    // ServerAPIの関数を実行
    const options = balance.initAuthorize();
    const log = balance.requestGetBalance(options);
    console.log(log);
  }
}

new Main();