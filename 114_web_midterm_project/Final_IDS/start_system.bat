@echo off
echo Starting SocksTrading System...

:: 1. Create Data Directory if missing
if not exist "mongo-data" mkdir mongo-data

:: 2. Start MongoDB (Background)
echo Starting MongoDB...
start "MongoDB Server" mongod --dbpath "./mongo-data" --bind_ip 127.0.0.1

:: 3. Wait for DB
timeout /t 5

:: 4. Start Backend (New Window)
echo Starting Backend API...
cd server
start "SocksBackend" cmd /k "npm install && node index.js"
cd ..

:: 5. Open Frontend
echo Opening Demo Page...
start demo.html

echo System Started!
pause
