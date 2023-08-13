import { TraderFactory } from "./trader/traderFactory";
import { Trader } from "./interface/trader";

export class Main {
  
  trader: Trader;
  constructor() {
    this.trader = TraderFactory.create();
  }
  
}

const main = new Main();

main.trader.trade();
// oneHalfTrader.calcProfit('JRF20220325-083323-143673');

