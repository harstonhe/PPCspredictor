FROM python:3.9-slim

WORKDIR /app

# 安装必要的包
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用文件
COPY . .

# 暴露端口 (使用8050端口，避免和常用端口冲突)
EXPOSE 8050

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV PORT=8050

# 启动命令
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8050"]
