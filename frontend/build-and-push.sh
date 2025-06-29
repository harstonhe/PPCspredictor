#!/bin/bash

# 构建Docker镜像
echo "正在构建Docker镜像..."
docker build -t heharston/ppcs-predictor:latest .

# 登录Docker Hub
echo "登录Docker Hub..."
docker login -u heharston -p aa7112766

# 推送镜像到Docker Hub
echo "推送镜像到Docker Hub..."
docker push heharston/ppcs-predictor:latest

echo "完成! 镜像已推送到Docker Hub: heharston/ppcs-predictor:latest"
