ShardingSphere 包括：
- ShardingSphere-JDBC 客户端分库分表
```xml
<dependency>
	<groupId>org.apache.shardingsphere</groupId>
	<artifactId>shardingsphere-jdbc</artifactId>
	<version>5.5.0</version>
	<exclusions>
		<exclusion>
			<groupId>org.apache.shardingsphere</groupId>
			<artifactId>shardingsphere-test-util</artifactId>
		</exclusion>
	</exclusions>
</dependency>
```
- ShardingSphere-Proxy 服务端分库分表，是一个独立部署的项目，而 Java 项目不是直接操作数据库了，而是操作 ShardingSphere-Proxy，再由 ShardingSphere-Proxy 操作数据库

---

canal ：将数据库的日志解析出来，发送到其他系统中
elastic search

[中文文档](https://www.bookstack.cn/books/shardingsphere-5.4.1-zh)


