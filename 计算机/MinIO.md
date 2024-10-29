
>[!quote] MinIO 
>MinIO 是一个对象存储系统

# ❤️ 安装
```bash
docker run --name minio \
    -p 9000:9000 \
    -p 9001:9001 \
    -v /path/to/minio-persistence:/bitnami/minio/data \
    -e MINIO_ROOT_USER=用户名
    -e MINIO_ROOT_PASSWORD=密码
    bitnami/minio:latest
```

>[!warning] minIO 的密码要设置超过 8 位，要不然会报错

1. **9000 端口**：这是 MinIO 的主要 API 端口，用于数据的对象存储操作。你可以通过这个端口进行文件的上传、下载和管理
2. **9001 端口**：这是 MinIO 控制台的端口，用于管理界面访问。通过这个端口，你可以使用浏览器访问 MinIO 的管理控制台，进行用户管理、监控等操作

# ❤️ 数据迁移
- [其他数据转 minIO](https://hackernoon.com/lang/zh/%E5%B8%AE%E5%8A%A9%E6%82%A8%E8%BF%9B%E5%85%A5minio%E7%9A%84%E6%95%B0%E6%8D%AE%E8%BF%81%E7%A7%BB%E5%B7%A5%E5%85%B7)

## minIO 转 minIO
### 使用 minIO Client 实现数据迁移
<u>安装 minIO Client</u> ：
- Win
	- [下载 minIO Client](https://min.io/download?license=enterprise&platform=kubernetes)
	- 将下载好的 mc.exe 文件放到 C:\Windows 下
	- 打开 cmd 运行 `mc --version` ，可以看到版本信息就可以
- Linux

<u>设置源，和目标</u> ：
```bash
mc alias set source http://127.0.0.1:9001 minio miniosecret
mc alias set dest http://127.0.0.1:9011 root pzq666666
```

jP10CpiCJ9PKx7EeKrs5
YXnf6FhLNtKkrARyUpfBsatgHoEaz6An4GPCwWtr


### 使用 rclone 实现数据迁移

