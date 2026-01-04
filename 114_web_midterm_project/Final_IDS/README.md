# SocksTrading (原味襪子搓合平台)

這是一個基於 MERN Stack 的襪子交易平台，支援直購與即時競標功能。

## 功能特色

- **使用者角色**：買家與賣家。
- **商品管理**：賣家可上架商品（包含圖片上傳）。
- **交易模式**：
  - **直購**：買家可直接購買。
  - **競標**：支援即時出價（Socket.io），倒數計時。
- **儀表板**：檢視銷售或購買紀錄。
- **排行榜**：熱銷賣家排行。

## 安裝與執行

### 1. 安裝相依套件

```bash
# 後端
cd server
npm install

# 前端
cd client
npm install
```

### 2. 環境變數設定

確保 `server/.env` 包含：
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/socks_trading
JWT_SECRET=your_secret_key
```

### 3. 初始化資料庫 (Seeding)

```bash
cd server
node seed.js
```

### 4. 啟動專案

**後端**
```bash
cd server
npm run dev
```

**前端**
```bash
cd client
npm run dev
```

## 技術堆疊

- MongoDB, Express, React, Node.js
- Socket.io (Real-time)
- Tailwind CSS (Styling)
- JWT (Auth)
