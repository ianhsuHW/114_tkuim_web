Week07 課堂實作 會員註冊表單

目標 整合 DOM 事件 即時驗證 客製化錯誤訊息與 UX 設計

檔案清單 signup_form html signup_form js styles css

必備功能完成清單

項目 必備欄位 說明 姓名 Email 手機 密碼 確認密碼 條款皆已實作 required 項目 事件委派 說明 興趣標籤區塊 interestTags 僅在父層監聽 click 事件 用於切換標籤樣式與驗證數量 項目 即時驗證 說明 blur 後啟用驗證 input 時即時更新錯誤提示 項目 客製訊息 說明 使用 input setCustomValidity 搭配欄位下方 p class text danger 顯示中文錯誤提示 項目 可及性 說明 所有錯誤提示透過 aria describedby 連結至欄位 p 標籤設定 aria live polite 確保輔助工具可讀取 項目 送出攔截 說明 form addEventListener submit 檢查所有欄位 失敗時以 firstInvalid focus 聚焦第一個錯誤 項目 防重送 說明 submitBtn 在送出時設為 disabled 並顯示 註冊中 模擬後端延遲 1 秒後才恢復

進階功能 加分項

項目 密碼強度條 狀態 完成 說明 實作 checkPasswordStrength 函式 即時更新進度條的寬度 顏色 progress bar 和文字提示 strength text 項目 重設按鈕 狀態 完成 說明 resetBtn 點擊後會清除表單內容 錯誤樣式 提示文字與密碼強度條狀態 項目 LocalStorage 暫存 狀態 完成 說明 saveFormData 和 loadFormData 函式會在使用者輸入時自動暫存資料 並在頁面重新整理時自動恢復未送出的內容 包括興趣標籤狀態

Git 推送指令

請將上述所有檔案存入 114_tkuim_web 1 1020 week07_lab 資料夾 並執行

到 repo 根目錄
cd "C:\Users\Ian hsu\114_tkuim_web"

1 建立資料夾
mkdir " \114_tkuim_web 1 \1020\week07_lab" Force

2 假設檔案已存入 Week07_lab
3 加入並提交
git add " \114_tkuim_web 1 \1020\week07_lab" git commit m "Week07 LAB Complete Signup Form with Live Validation & Advanced Features"

4 先拉遠端再推
git pull rebase origin main git push