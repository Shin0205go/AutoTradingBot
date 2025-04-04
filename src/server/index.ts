import { TraderFactory } from "./trader/traderFactory";
import { Trader } from "./interface/trader";
import { GameMain } from "./trader/character/gameMain";
import { CharacterTraderFactory } from "./trader/character/characterTraderFactory";

export class Main {
  
  trader: Trader;
  gameMain: GameMain;
  
  constructor() {
    this.trader = TraderFactory.create();
    this.gameMain = new GameMain();
  }
  
  runTraditionalTrader() {
    console.log("従来のトレーダーを実行します...");
    this.trader.trade();
  }
  
  async runGameSystem() {
    console.log("ゲームシステムを開始します...");
    await this.gameMain.start();
  }
  
  getAvailableCharacters() {
    return CharacterTraderFactory.getAvailableTraders();
  }
}

const main = new Main();

const useGameSystem = true; // Set to false to use traditional trader

if (useGameSystem) {
  main.runGameSystem();
} else {
  main.runTraditionalTrader();
}

