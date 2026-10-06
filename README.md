# 短訊記帳CSV

把香港滙豐、恒生、中銀、渣打的信用卡簽賬短訊（英文或繁體中文）在瀏覽器內整理成消費摘要，並下載 UTF-8 BOM CSV。

**線上工具：** https://brianlam1021.github.io/hk-sms-csv/

本頁只格式化你貼上的文字。不是銀行夥伴、不是戶口結餘、也不是詐騙偵測。短訊不會上傳，也不會寫入 `localStorage`。

## 使用

1. 打開 GitHub Pages 頁面，或於本機執行 `npm start` 後前往 http://127.0.0.1:4173/
2. 貼上卡簽賬短訊，或按「載入示範短訊」（全部虛構，沒有真實客戶資料）
3. 核對摘要、預覽與未能辨識的行
4. 下載 CSV

未能對上的行會留在頁面上，但不計入總額，也不會寫入 CSV。

## 本機測試

```bash
npm test
```

解析邏輯在 `parser.js`（`docs/` 亦有一份，方便 Pages 選 `/` 或 `/docs`）。

若 `https://brianlam1021.github.io/hk-sms-csv/` 仍是 404，用有 Admin 權限的帳號打開 [Pages 設定](https://github.com/brianlam1021/hk-sms-csv/settings/pages)，Source 選 **Deploy from a branch**，Branch 選 `main`，Folder 選 `/` 或 `/docs`，然後 Save。此倉庫的 integration token 沒有 Administration 權限，無法代你開啟 Pages。

## Cloudflare Pages（可選自動上傳）

Cloudflare Pages 這個專案是 **direct-upload**，不會因 `main` 有新 commit 而自動部署。`.github/workflows/cloudflare-pages.yml` 會在推到 `main`（`docs/**`）或手動 `workflow_dispatch` 時把 `docs/` 上傳到 Pages 專案 `hk-sms-csv`。未設定 token 時 workflow 會跳過並成功結束。

要啟用，Brian 需在 repo Settings → Secrets and variables → Actions 加入：

1. `CLOUDFLARE_API_TOKEN` — 有 Cloudflare Pages 寫入權限的 API token
2. `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 帳戶 ID
