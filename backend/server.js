const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 80;

// JSONファイルのパス
const RANKINGS_FILE = path.join(__dirname, 'rankings.json');

// ランキングデータをロードする関数
const loadRankings = () => {
    if (fs.existsSync(RANKINGS_FILE)) {
        const data = fs.readFileSync(RANKINGS_FILE, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

// ランキングデータを保存する関数
const saveRankings = (rankings) => {
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify(rankings, null, 2), 'utf-8');
};

// 初期ランキングデータをロード
let rankings = loadRankings();

app.use(cors());
app.use(bodyParser.json());

// ランキングを取得するAPI
// ランキングを取得するAPI（難易度でフィルタリング）
app.get('/rankings', (req, res) => {
    const filteredRankings = rankings.slice(0, 5); // 上位5件を返す

    res.json(filteredRankings);
});

// スコアを送信するAPI
app.post('/rankings', (req, res) => {
    const { name, score, difficulty } = req.body;
    if (typeof name !== 'string' || typeof score !== 'number' || typeof difficulty !== 'string') {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    // ランキングに追加し、スコア順にソート
    rankings.push({ name, score, difficulty });
    rankings = rankings.sort((a, b) => b.score - a.score);

    // JSONファイルに保存
    saveRankings(rankings);

    res.json({ message: 'Score added', rankings });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
