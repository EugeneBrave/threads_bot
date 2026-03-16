FROM python:3.13-slim

# 設定環境變數
ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Taipei

# 設定工作目錄
WORKDIR /app

# 複製 requirements.txt 並安裝相依套件
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 安裝 Playwright 需要的瀏覽器 (僅限 Chromium) 以及系統層級的依賴
# 安裝完畢後清理 apt 快取以縮小 Image 體積
RUN playwright install chromium --with-deps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 複製所有程式碼到容器內
COPY . .

# 預設執行主程式 (main.py 內建有 while True 的 schedule 迴圈)
CMD ["python", "main.py"]
