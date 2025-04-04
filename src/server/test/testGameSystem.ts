import { MockGameMain } from "../api/mock/mockGameMain";

console.log("ゲームシステムのモックテストを開始します...");

const mockGame = new MockGameMain();
mockGame.start().then(() => {
    console.log("モックテスト完了！");
    process.exit(0); // Ensure the process exits with success code
}).catch((error: Error) => {
    console.error("テスト中にエラーが発生しました:", error);
    process.exit(1); // Exit with error code on failure
});
