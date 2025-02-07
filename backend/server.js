const express = require('express'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const { put, get } = require("@vercel/blob");

const app = express();
const PORT = 80;
const RANKINGS_BLOB = "rankings.json";

app.use(cors());
app.use(bodyParser.json());

// ランキングデータをロードする関数
const loadRankings = async () => {
    try {
        const response = await fetch(`https://xrlzmauec1gepnkb.public.blob.vercel-storage.com/${RANKINGS_BLOB}`);
        if (!response.ok) throw new Error("Failed to fetch rankings");
        const data = await response.text();
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading rankings:", error);
        return [];
    }
};

// ランキングデータを保存する関数
const saveRankings = async (rankings) => {
    try {
        if(rankings["name"].length > 10){
            rankings["name"] = rankings["name"].slice(0,10)
        }
        await put(RANKINGS_BLOB, JSON.stringify(rankings, null, 2), { access: "public", addRandomSuffix: false });
    } catch (error) {
        console.error("Error saving rankings:", error);
    }
};

// ランキングを取得するAPI
app.get('/rankings', async (req, res) => {
    const rankings = await loadRankings();
    res.json(rankings.slice(0, 5)); // 上位5件を返す
});

// スコアを送信するAPI
app.post('/rankings', async (req, res) => {
    const { name, score, difficulty } = req.body;
    if (typeof name !== 'string' || typeof score !== 'number' || typeof difficulty !== 'string') {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    const rankings = await loadRankings();
    rankings.push({ name, score, difficulty });
    rankings.sort((a, b) => b.score - a.score);

    await saveRankings(rankings);
    res.json({ message: 'Score added', rankings });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
