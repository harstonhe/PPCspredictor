#!/bin/bash

# 启动gunicorn服务
gunicorn --bind 0.0.0.0:8050 app:app
