@echo off
echo 正在构建Docker镜像...
docker build -t heharston/ppcs-predictor:latest .

echo 登录Docker Hub...
docker login -u heharston -p aa7112766

echo 推送镜像到Docker Hub...
docker push heharston/ppcs-predictor:latest

echo 完成! 镜像已推送到Docker Hub: heharston/ppcs-predictor:latest
pause
