## WSTools - WebSocket工具平台

### 生产部署

**构建前端镜像**

```shell
docker build -t wstool-ui:latest .
```

**启动服务**

```shell
docker run --name wstool-ui --restart=always -p 3001:3001 wstool-ui:latest
```

**常用命令**

```shell
docker run --name nginx --restart=always -p 443:443 -p 80:80 -d -v /usr/local/nginx/nginx.conf:/etc/nginx/nginx.conf -v /usr/local/web:/usr/local/web -v /usr/local/upload:/usr/local/upload nginx

```