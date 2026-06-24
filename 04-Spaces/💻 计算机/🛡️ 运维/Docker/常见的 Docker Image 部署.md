# alist
<u>安装部署</u> ：
- 使用 Docker 安装
```bash
docker run -d \
  -p 5244:5244 \
  -e PUID=0 \
  -e PGID=0 \
  -e UMASK=022 \
  --name="alist" \
  xhofe/alist:v3.41.0

docker run -d -p 5244:5244 -e PUID=0 -e PGID=0 -e UMASK=022 --name="alist" xhofe/alist:v3.41.0
```
- [使用 Docker 更新](https://alistgo.com/zh/guide/install/docker.html#docker%E5%AE%89%E8%A3%85%E6%80%8E%E4%B9%88%E6%9B%B4%E6%96%B0)
- 修改 alist 登录密码，用户名默认 admin
```bash
docker exec -it alist ./alist admin set 密码
```

<u>使用</u> ：
- 阿里云
	- 挂载阿里云盘选择阿里云盘Open，这是官方的
	- 给云盘加密码到**元信息**中加
- 115
	- 登录 115 网页版，获取 cookie，cookie 的格式必须是 UID=xxx;CID=xxx;SEID=xxx
	- 然后添加

# NocoDB
```bash
docker run -d \
  --name noco \
  -v "$(pwd)"/nocodb:/usr/app/data/ \
  -p 8043:8080 \
  -e NC_DB="pg://192.168.0.4:5432?u=postgres&p=13433026660&d=nocodb" \
  -e NC_AUTH_JWT_SECRET="e3b0c442-98fc-1c14-9af7-4f3b6a7f9ea1" \
  nocodb/nocodb:latest
```

