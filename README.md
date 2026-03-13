# Threads Telegram Bot 🧵🤖

這是一個自動化的 Python 爬蟲與 Telegram 機器人程式。
它每天會自動到 Threads 網站上搜尋特定關鍵字（例如：男生穿搭、美式復古、阿美咔嘰），找出當日討論度最高的十篇公開貼文，並將內容摘要與連結整理後，自動透過 Telegram 機器人發送到你的手機上。

## 核心功能功能
- **自動化網頁爬蟲**：無須申請嚴格的 Meta 官方 API 存取權限，直接使用 Playwright 模擬真實使用者於背景抓取每日最熱門公開貼文。
- **自訂關鍵字搜尋**：支援透過 Python 設定多組想追蹤的關鍵字。
- **每日定時推播**：內建排程功能（預設每日 09:00），每天時間一到自動執行抓取並將精華內容發送到 Telegram。
- **即時執行模式**：支援指令參數 `python main.py --now`，可略過排程立刻執行一次完整的抓取與資料推播流程。

---

## 系統需求
- Python 3.10 或更新版本
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
```

---

## 如何執行

有兩種模式可以啟動此機器人：

### 模式一：自動排程模式（預設）
機器人啟動後會以常駐程式的形式掛載在背景，每天抵達指定時間（預設為早上 09:00）時自動執行爬蟲與訊息發送。

```powershell
python main.py
```
*(若要修改排程時間，請開啟 `main.py` 並修改 `schedule_time = "09:00"` 變數)*

### 模式二：即時執行模式
非常適合用來**測試**或**手動更新日報**。程式啟動後會立刻忽略排程觸發，完整執行一次「搜尋 👉 爬取 👉 發送訊息」的流程，完成後程式會自動關閉結束，不會留存於背景。

```powershell
python main.py --now
```

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
