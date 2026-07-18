```xml
<dependency>
    <groupId>com.alibaba.otter</groupId>
    <artifactId>canal.client</artifactId>
    <version>1.1.7</version>
</dependency>
<dependency>
    <groupId>com.alibaba.otter</groupId>
    <artifactId>canal.protocol</artifactId>
    <version>1.1.7</version>
</dependency>

implementation group: 'com.alibaba.otter', name: 'canal.client', version: '1.1.7'
implementation group: 'com.alibaba.otter', name: 'canal.protocol', version: '1.1.7'
```

http://xiaoyuge.work/cancel/index.html#1-%E7%AE%80%E4%BB%8B

> [!quote] Canal
> 在 MySQL 中，主服务器 Master 将所有的数据变化~~【INSERT、UPDATE、DELETE 操作】~~记录到 binlog 日志文件中，从服务器 Slave 会定期向主服务器请求数据更新，进行同步，**而 Canal 就模拟了从服务器的角色**

# ❤️ 配置

> [!warning] 使用 Canal 需要开启 MySQL 的 mysql_native_password 插件，所以 MySQL 最高只支持 8.4.0

- mysql 开启 binlog 
```bash
server-id=1           # 需要设置一个唯一的 server-id
log_bin=mysql-bin     # 启用 binlog，并设置日志文件的前缀
binlog_format=row     # 确认数据一致，比如now()为当时的时间，而不是真的现在的时间
binlog_do_db=ds_0     # 监控指定的数据库 ds_0
binlog_do_db=ds_1     # 监控指定的数据库 ds_1
```
- 用 sql 测试 `SHOW VARIABLES LIKE 'log_bin';` 是否开启
- 新建 canal 用户
```sql
# 安装 mysql_native_password 插件
INSTALL PLUGIN mysql_native_password SONAME 'mysql_native_password';

# 创建 Canal 用户并设置密码，和允许访问的ip，这里是localhost
CREATE USER 'canal'@'localhost' IDENTIFIED WITH mysql_native_password BY 'canal';
# 授予权限
GRANT ALL PRIVILEGES ON *.* TO 'canal'@'localhost' WITH GRANT OPTION;

# 刷新
FLUSH PRIVILEGES;

# 查询用户
SELECT User, Host FROM mysql.user;
```
- 运行 canal 容器
```bash
# 配置文件在 /home/admin/canal-server/conf
# 日志文件在 /home/admin/canal-server/logs

docker run -d \
  --name canal-server \
  -p 11110:11110 \
  -p 11111:11111 \
  -p 11112:11112 \
  -p 9100:9100 \
  -e canal.instance.master.address=127.0.0.1:3306 \
  -e canal.instance.dbUsername=canal \
  -e canal.instance.dbPassword=canal \
  -e canal.instance.connectionCharset=UTF-8 \
  -e canal.instance.tsdb.enable=true \
  -e canal.instance.gtidon=false \
  -e canal.instance.filter.regex=.*\\..* \
  -e TZ=Asia/Shanghai \
  canal/canal-server:v1.1.8-alpha-3

docker run -d --name canal-server -p 11110:11110 -p 11111:11111 -p 11112:11112 -p 9100:9100 -e canal.instance.master.address=127.0.0.1:3306 -e canal.instance.dbUsername=canal -e canal.instance.dbPassword=canal -e canal.instance.connectionCharset=UTF-8 -e canal.instance.tsdb.enable=true -e canal.instance.gtidon=false -e canal.instance.filter.regex=.*\\..* -e TZ=Asia/Shanghai canal/canal-server:v1.1.8-alpha-3
```

# ❤️ 基础概念
canal 架构 ：
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20241106192838.png)

## 数据载体
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20241108175100.png)

- `Entry` 一条 SQL 语句的所有信息
	- `EntryType` 消息的类型
		- **ROWDATA** 数据变更类型 ~~【增，删，改】~~
		- DDL 
		- QUERY 查询类型，~~该类型的数据记录的是查询的结果集，而不是 SELECT 语句~~
		- HEARTBEAT canal 的心跳包类型
		- BINLOG
	- `RowChange` 一条 SQL 语句
		- `EventType` 
			- INSERT
			- UPDATE
			- DELETE
		- `RowDatasList` 这条 SQL 所涉及到的所有行数据
			- `RowData` 涉及到的一行数据
				- BeforeColumns 这条数据原始的所有 Column 数据
				- AfterColumns 这条数据更新后的所有 Column 数据



# 实战

