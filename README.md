# 2026 東京旅遊

春日員工旅遊活動網站，包含四日行程與報名表單。

## 本機預覽

啟動內建的本機 HTTP 伺服器：

```powershell
node preview-server.js
```

接著瀏覽 `http://127.0.0.1:8000`。

## Google Sheet 報名設定

1. Apps Script 專案「2026公司旅遊」已部署為網頁應用程式，以擁有者身分執行，並允許報名者存取。
2. 表單已連接部署取得的 `/exec` 網址。第一次成功報名時，程式會建立「2026公司旅遊」試算表及「報名資料」工作表，並寫入標題列。
3. Apps Script 會在每次寫入前將「電話」欄設為純文字，保留手機號碼前導零。報名透過隱藏表單目標送出，避免瀏覽器跨網域讀取限制。

> 若 Apps Script 網址尚未設定，表單不會假裝報名成功。

## GitHub Pages

網站已發布於 [GitHub Pages](https://lynnlung.github.io/2026-tokyo-trip/)。GitHub 儲存庫：[2026-tokyo-trip](https://github.com/lynnlung/2026-tokyo-trip)。`SPEC/` 規格資料夾不會推送至儲存庫。
