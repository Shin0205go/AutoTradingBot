import { MockGameMain } from "../api/mock/mockGameMain";

console.log("ゲームシステムのモックテストを開始します...");

const mockGame = new MockGameMain();
mockGame.start().then(() => {
    console.log("モックテスト完了！");
}).catch(error => {
    console.error("テスト中にエラーが発生しました:", error);
});
