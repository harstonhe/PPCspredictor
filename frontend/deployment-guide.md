# PPCs预测模型Docker部署指南

## 本地构建和推送镜像

1. 构建Docker镜像
```bash
docker build -t heharston/ppcs-predictor:latest .
```

2. 登录Docker Hub
```bash
docker login -u heharston -p aa7112766
```

3. 推送镜像到Docker Hub
```bash
docker push heharston/ppcs-predictor:latest
```

## 服务器部署步骤

1. 登录服务器
```bash
ssh your-username@156.245.201.41
```

2. 登录Docker Hub
```bash
docker login -u heharston -p aa7112766
```

3. 拉取镜像
```bash
docker pull heharston/ppcs-predictor:latest
```

4. 启动容器
```bash
docker run -d --name ppcs-predictor -p 8050:8050 heharston/ppcs-predictor:latest
```

5. 验证容器是否正常运行
```bash
docker ps
```

## Nginx配置（如果服务器使用Nginx作为Web服务器）

在服务器的Nginx配置中添加以下配置，将/PPCspredictor.html请求转发到Flask应用：

```
location /PPCspredictor.html {
    proxy_pass http://localhost:8050/PPCspredictor.html;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /PPCspredictor {
    proxy_pass http://localhost:8050/PPCspredictor;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /predict {
    proxy_pass http://localhost:8050/predict;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /static/ {
    proxy_pass http://localhost:8050/static/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

然后重启Nginx:
```bash
sudo systemctl restart nginx
```

## 访问测试

部署完成后，通过以下URL访问应用：
http://156.245.201.41/PPCspredictor.html

## 故障排除

1. 如果应用无法访问，检查容器日志：
```bash
docker logs ppcs-predictor
```

2. 如果Nginx配置有问题，检查Nginx错误日志：
```bash
sudo tail -f /var/log/nginx/error.log
```

3. 如果需要重启容器：
```bash
docker restart ppcs-predictor
```

4. 如果需要停止并删除容器：
```bash
docker stop ppcs-predictor
docker rm ppcs-predictor
```

5. 如果需要重新部署最新版本：
```bash
docker pull heharston/ppcs-predictor:latest
docker stop ppcs-predictor
docker rm ppcs-predictor
docker run -d --name ppcs-predictor -p 8050:8050 heharston/ppcs-predictor:latest
```
