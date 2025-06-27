# PPCs预测模型前端项目

此项目提供了一个用于预测术后肺部并发症(PPCs)风险的Web应用界面。项目使用Flask作为后端服务，提供API和静态文件服务。

## 项目结构

```
frontend/
 app.py                  # Flask应用主文件
 requirements.txt        # Python依赖项
 Dockerfile              # Docker构建文件
 docker-compose.yml      # Docker Compose配置
 .dockerignore           # Docker构建忽略文件
 build-and-push.sh       # Linux构建脚本
 build-and-push.bat      # Windows构建脚本
 docker-start.sh         # Docker容器启动脚本
 deployment-guide.md     # 部署指南
 static/                 # 静态资源
    css/                # CSS样式文件
    js/                 # JavaScript文件
    images/             # 图片资源
 templates/              # HTML模板
     PPCspredictor.html  # 主页面模板
```

## 本地开发

1. 安装依赖:
```bash
pip install -r requirements.txt
```

2. 运行服务:
```bash
python app.py
```

3. 访问网站:
```
http://localhost:8050/PPCspredictor.html
```

## Docker部署

请参考 `deployment-guide.md` 文件获取详细的部署指南。

1. 使用提供的脚本构建并推送Docker镜像:
```bash
# Linux/Mac
./build-and-push.sh

# Windows
.\build-and-push.bat
```

2. 在服务器上拉取并运行Docker容器:
```bash
docker pull heharston/ppcs-predictor:latest
docker run -d --name ppcs-predictor -p 8050:8050 heharston/ppcs-predictor:latest
```

3. 配置Web服务器转发请求:
参考 `deployment-guide.md` 中的Nginx配置示例。

## 访问部署后的应用

部署完成后，可以通过以下URL访问应用:
```
http://156.245.201.41/PPCspredictor.html
```
