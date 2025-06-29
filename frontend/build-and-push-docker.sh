#!/bin/bash

# 设置Docker仓库信息
DOCKER_USERNAME="heharston"
DOCKER_PASSWORD="aa7112766"
IMAGE_NAME="ppcs-predictor"
TAG="latest"

# 登录到Docker Hub
echo "正在登录Docker Hub..."
echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin

# 构建Docker镜像
echo "正在构建Docker镜像..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .

# 推送镜像到Docker Hub
echo "正在推送镜像到Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG

echo "完成! 镜像已推送至: $DOCKER_USERNAME/$IMAGE_NAME:$TAG" 