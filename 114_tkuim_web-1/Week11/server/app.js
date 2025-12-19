import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED = process.env.ALLOWED_ORIGIN?.split(',').map(s=>s.trim()).filter(Boolean) ?? '*';

app.use(cors({ origin: ALLOWED }));
app.use(express.json());

// 簡單健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log([Server] Running on http://localhost:);
  console.log([CORS] Allowed:, ALLOWED);
});
