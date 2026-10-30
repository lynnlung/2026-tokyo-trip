# 2026 東京旅遊

春日員工旅遊活動網站，包含四日行程與報名表單。

## 本機預覽

啟動內建的本機 HTTP 伺服器：

```powershell
node preview-server.js
```

接著瀏覽 `http://127.0.0.1:8000`。

## Google Sheet 報名設定

1. 在 [Google Apps Script](https://script.google.com/) 建立專案，將 `apps-script/Code.gs` 的內容貼入指令碼編輯器。
2. 儲存並部署為「網頁應用程式」，執行身分選「我」，存取權限依公司政策設定為報名者可使用。
3. 首次部署時登入 Google 並授權試算表與 Drive 存取權限。第一次收到報名時，程式會建立「2026公司旅遊」試算表及「報名資料」工作表，並寫入標題列。
4. 將部署取得的 `/exec` 網址填入 `app.js` 開頭的 `APPS_SCRIPT_URL`。
5. Apps Script 會在每次寫入前將「電話」欄設為純文字，保留手機號碼前導零。報名透過隱藏表單目標送出，避免瀏覽器跨網域讀取限制。

> 網頁在尚未設定 Apps Script 網址前不會假裝報名成功；表單會提示尚未連接試算表。

## GitHub Pages

網站已發布於 [GitHub Pages](https://lynnlung.github.io/2026-tokyo-trip/)。GitHub 儲存庫：[2026-tokyo-trip](https://github.com/lynnlung/2026-tokyo-trip)。`SPEC/` 規格資料夾不會推送至儲存庫。
