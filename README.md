# Threads Telegram Bot 🧵🤖

這是一個自動化的 Python 爬蟲與 Telegram 機器人程式。
它每天會自動到 Threads 網站上搜尋特定關鍵字（例如：男生穿搭、美式復古、阿美咔嘰），找出當日討論度最高的十篇公開貼文，並將內容摘要與連結整理後，自動透過 Telegram 機器人發送到你的手機上。

## 核心功能
- **自動化網頁爬蟲**：無須申請嚴格的 Meta 官方 API 存取權限，直接使用 Playwright 模擬真實使用者於背景抓取每日最熱門公開貼文。
- **自訂關鍵字搜尋**：支援透過 Python 設定多組想追蹤的關鍵字（預設每組關鍵字各自選取 5 篇熱點文章）。
- **AI 智能摘要**：使用 Google Gemini 2.5 Flash 模型，能自動過濾無關雜訊、總結今日時尚趨勢，並整理出精美的介紹文案。
- **每日雲端定時推播**：支援透過 GitHub Actions 每天早上定時在雲端自動執行，不再需要開啟個人電腦，直接將精華摘要發送到 Telegram！
- **Web 瀏覽頁面 (New!)**：內建 React + TypeScript 前端，以類似 Threads 的排版展示每日精選貼文，自動部署至 GitHub Pages，隨時可線上瀏覽。

---

## 系統需求
- Python 3.13 或更新版本
- Node.js 22+（僅 Web 前端開發時需要）
- 一個有效的 Telegram Bot Token (需從 Telegram 向 [@BotFather](https://t.me/botfather) 申請)
- 你的 Telegram Chat ID (用來接收訊息的對象，可向 [@userinfobot](https://t.me/userinfobot) 查詢)

---

## 快速開始與環境建置

### 1. 安裝專案依賴套件

請確保你的終端機 (Terminal / Command Prompt / PowerShell) 位於專案資料夾底下。
建議使用虛擬環境 (Virtual Environment) 以免套件版本與系統衝突：

```powershell
# 建立虛擬環境
python -m venv venv

# 啟動虛擬環境 (Windows PowerShell)
.\venv\Scripts\activate
# 若使用 macOS/Linux 則為: source venv/bin/activate

# 安裝 Python 相關套件
pip install -r requirements.txt
```

### 2. 安裝自動化瀏覽器 (Playwright)

因為本程式透過真實的 Chrome (Chromium) 核心進行非同步網頁渲染與爬取，初次執行前**必須**安裝自動化瀏覽器的相關元件：

```powershell
playwright install chromium
```

### 3. 設定環境參數配置

本專案使用 `.env` 來安全地管理你的所有金鑰參數。這可以避免你不小心把這些重要的密碼發布到 GitHub 等公開網路上。

請將專案根目錄中的 `.env.example` 檔案**複製一份**並重新命名為 `.env`，接著根據下列指示填入：

```env
# 你的 Telegram 機器人金鑰 (透過向 @BotFather 申請獲得)
TELEGRAM_BOT_TOKEN=8717XXXXXXXX:AAGXXXXXXXXXXXXXXXXXXX

# 你的個人或群組聊天室 ID
TELEGRAM_CHAT_ID=123456789

# (選填) 若未來 Meta 開放完整 Threads API，或需要登入操作，可於此配置 Token
THREADS_ACCESS_TOKEN=your_threads_access_token_here

# AI 摘要使用的金鑰 
GEMINI_API_KEY=你的Google_Gemini_API_Key
```

---

## 如何執行

有三種模式可以啟動此機器人：

### 模式一：雲端完全自動化 (透過 GitHub Actions) 🚀 最推薦
專案中已經設定好 `.github/workflows/daily_run.yml`。只要將專案上傳至 GitHub，設定好 `Settings > Secrets and variables > Actions` 中的密碼：
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `GEMINI_API_KEY`
系統就會在每天早上自動化幫你跑完流程發訊息，**完全免費且免掛機**。

### 模式二：本機即時執行測試
非常適合用來**測試**或**手動更新日報**。程式啟動後會完整執行一次「搜尋 👉 AI摘要 👉 發送訊息」的流程，完成後程式自動結束。

```powershell
python main.py --now
```

### 模式三：Synology NAS / Docker 部署 (推薦做為 24 小時代管方案)
如果你有 Synology NAS 或任何支援 Docker 的伺服器，可以使用我們準備好的 Docker 環境來運行，這能確保環境乾淨獨立且穩定運行。

1. 將專案的所有檔案放進你的 NAS 目錄中 (例如 `docker/threads_bot`)。
2. 在該目錄新增 `.env` 檔案並填入你的金鑰。
3. **在 Synology Container Manager 中**：
   - 選擇「新增專案」，來源選擇 `建立 docker-compose.yml` (系統會自動抓取目錄內的檔案)
   - 點擊「建置並啟動此專案」即可。
4. **或透過 SSH 啟動**：
   ```bash
   sudo docker-compose up -d --build
   ```
   > 容器已預設掛載 `/etc/localtime` 來同步主機的台灣時間，確保每天早上 09:00 準時發送！

---

### 模式四：本機自管排程模式
如果你想把腳本架設在自己的伺服器或樹莓派上常駐運行（非 Docker 環境），可以不帶參數啟動。機器人會以常駐程式的形式掛載在背景，每天抵達指定時間（預設為早上 09:00）時自動執行。

```powershell
python main.py
```

---

## Web 瀏覽頁面

專案內建一個以 **React + Redux + TypeScript + styled-components** 打造的前端網頁，部署於 GitHub Pages 上，以類似 Threads 的深色介面呈現每日精選貼文。

### 技術架構
| 項目 | 技術 |
|---|---|
| 框架 | React 19 + TypeScript |
| 狀態管理 | Redux Toolkit |
| 樣式 | styled-components |
| 建置工具 | Vite 6 |
| 部署 | GitHub Pages (自動) |

### 本機開發
```bash
cd web
npm install
npm run dev
```

### 資料來源
每日 Bot 執行後會自動將爬取結果寫入 `web/public/data/posts.json`（保留最近 5 天），並由 GitHub Actions 自動 commit 回 repo 觸發前端重新部署。

### GitHub Pages 部署
1. 到 repo **Settings → Pages → Source** 選擇 **GitHub Actions**
2. 推送程式碼後，`.github/workflows/deploy_web.yml` 會自動建置並部署
3. 部署完成後可於 `https://<username>.github.io/threads_bot/` 瀏覽

---

## 自訂爬蟲關鍵字
這支程式預設追蹤三個主題：`男生穿搭`, `美式復古`, `阿美咔嘰`。
若你想更換主題或增減數量，隨時打開 `config.py` 檔案修改 `KEYWORDS` 陣列即可：

```python
# config.py
KEYWORDS = ["球鞋推薦", "美式復古", "健身菜單"]
```

## 常見問題 (FAQ)

**Q: 為什麼在 Windows 執行結束時，終端機偶爾會閃過一行 `RuntimeError: Event loop is closed` 警告？**  
A: 這是一個 Python `asyncio` 搭配 Playwright 在 Windows 環境下結束資源回收時常見的無害訊息。完全不會影響程式的運行、爬取或訊息推播。目前的程式碼已包含可以隱藏此錯誤的補丁。

**Q: Threads 的介面改版導致爬蟲抓不到資料了？**  
A: Threads 網頁結構更新時，爬蟲 (scraper.py) 可能無法正確選取到 HTML 元素。若發生此事，只需由開發者開啟 `scraper.py`，更新 `valid_items = await page.evaluate(...)` 中對應的 CSS 選取器 (Selector) 即可。 

#test