import express from 'express';
import { Main } from './index';  // Mainクラスのインポート

const app = express();
const PORT = 3000;

const mainInstance = new Main();
// 必要に応じてMainクラスのメソッドやプロパティを利用

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/traders', (req, res) => {
    // ここでトレーダーのリストを取得するロジックを実装
    res.json({ traders: ["OneHalfTrader", "SampleTrader"] });
});