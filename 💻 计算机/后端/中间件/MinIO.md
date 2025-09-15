https://www.hxstrive.com/subject/minio/680.htm

https://www.cnblogs.com/hellxz/p/17359828.html#minio%E5%AE%A2%E6%88%B7%E7%AB%AF%E6%96%B9%E5%BC%8F%E6%93%8D%E4%BD%9Cs3

> [!quote] MinIO 
> MinIO 是一个对象存储系统

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

> [!warning] minIO 的密码要设置超过 8 位，要不然会报错

1. **9000 端口**：这是 MinIO 的主要 API 端口，用于数据的对象存储操作。你可以通过这个端口进行文件的上传、下载和管理
2. **9001 端口**：这是 MinIO 控制台的端口，用于管理界面访问。通过这个端口，你可以使用浏览器访问 MinIO 的管理控制台，进行用户管理、监控等操作

# ❤️ Java SDK
```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.17</version>
</dependency>
```

## 💛 配置
```java
@Configuration
public class MinioClientConfig {
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint("http://localhost:9000")
                .credentials("root", "pzqPZQ123")
                .build();
    }
}
```

## 💛 桶
- `boolean bucketExists(String bucket)` 判断桶是否存在


## 文件
### 上传

> [!warning] 上传时，文件重名会进行覆盖，所以上传时文件名要唯一

<u>从本地文件上传</u> ：
- bucket 是桶名，如果不存在会报错
- object 是上传到 minio 的路径
- filename 是本地路径
```java
UploadObjectArgs uploadObjectArgs = UploadObjectArgs.builder()
		.bucket("test")
		.object("Grey_Icons.png")
		.filename("E:\\图片\\Grey_Icons.png")
		.build();
minioClient.uploadObject(uploadObjectArgs);
```

<u>从文件流上传</u> ：
```java
try (InputStream stream = new FileInputStream("E:\\Grey_Icons.png")) {
	minioClient.putObject(PutObjectArgs.builder()
			.bucket("test")
			.object("Grey_Icons_FromStream.png")
			.stream(stream, stream.available(), -1)
			.build()
	);
}
```

<u>从 MultipartFile 上传</u> ：
```java
minioClient.putObject(PutObjectArgs.builder()
		.bucket("test")           
		.object(file.getOriginalFilename())      
		.stream(file.getInputStream(), file.getSize(), -1)
		.build()
);
```

### 查看
- 直接下载 `http://localhost:9000/桶名/文件名` 

### 删除
```java
RemoveObjectArgs removeObjectArgs = RemoveObjectArgs.builder()
		.bucket("test")
		.object("Grey_Icons.png")
		.build();
minioClient.removeObject(removeObjectArgs);
```

### 下载
```java
DownloadObjectArgs downloadObjectArgs = DownloadObjectArgs.builder()
		.bucket("test")
		.object("Grey_Icons.png")
		.filename("D:\\images\\pic2.jpg")
		.build();
minioClient.downloadObject(downloadObjectArgs);
```


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
