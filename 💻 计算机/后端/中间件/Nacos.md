
https://www.cnblogs.com/jajian/p/18163704

> [!QUOTE] 背景
> 在传统的 RPC 远程调用框架中，管理服务之间的依赖关系比较复杂：
> - 我们需要记录对方服务的 IP 和端口，集群模式下还需要设置多个 IP
> - 如果调用的服务很多，单纯的维护这些信息就会造成配置问题件很繁琐，而且无法动态应对服务地址的变更、服务机器量的变更
> 
> 所以需要使用服务注册中心管理服务之间的依赖关系，可以实现服务调用、负载均衡、容错等，实现服务发现与注册

# ❤️ 理论
Nacos 是构建云原生应用的**动态服务发现**、**配置管理**、**服务管理平台**

> [!NOTE] 选择 AP 还是 CP ？
> 要依照业务场景进行决定：
> - CP (Consistency Partition)：对数据一致性要求较高，且可以容忍一定时间的不可用
> - AP (Availability Partition)：可以容忍一定时间的数据不一致性，但不能容忍不可用现象发生
> 
> **Nacos 既可以 AP，也可以 CP；但 Zookeeper 只能 CP**

### 三大概念
<u>Namespace</u> ：Namespace 是用来做资源隔离的，用于**多租户、多环境**。
- 命名方式 ：项目名 - 租户标识 - 环境名，例如 mall-dev

---

<u>Group</u> ：对配置按照某种规则进行逻辑分组，方便同一 Namespace 下的配置分类管理
- 例如按服务划分，用户服务配置 `user-service-group` ，订单服务配置 `order-service-group`
- 在 Nacos 上创建一个配置时，如果未填写配置分组名，则配置分组名为 DEFAULT_GROUP
- **如果一个服务下的配置少的话，无需划分多个 Group，使用默认的即可**
- 命名方式 ：以业务名开头，GROUP 结尾，例如 GATEWAY_GROUP

---

<u>Data ID</u> ：唯一标识一个具体的配置集（如配置文件）
- 在同一 Group 下，必须唯一
- 命名方式 ：项目名 - 配置类别，例如 market-shardingsphere

# ❤️ 实战
## 💛 Server
<u>docker 部署</u> ：
- 创建好数据库 nacos ，[执行 sql 语句](https://github.com/alibaba/nacos/blob/master/distribution/conf/mysql-schema.sql)
- 运行 docker 命令
	- `9848` 客户端 gRPC 请求服务端端口，用于客户端向服务端发起连接和请求
	- `9849` 服务端 gRPC 请求服务端端口，用于服务间同步 ……
```bash
docker run -d -p 8848:8848 -p 9848:9848 -p 9849:9849 --name nacos \
  -e JVM_XMS=256m \  # 指定 JVM 的初始堆内存大小为 256MB
  -e JVM_XMX=256m \  # 指定 JVM 的最大堆内存大小为 256MB
  -e MODE=standalone \  # 单机模式
  -e SPRING_DATASOURCE_PLATFORM=mysql \  # 数据库平台
  -e MYSQL_SERVICE_HOST=192.168.0.12 \  # 主机ip
  -e MYSQL_SERVICE_PORT=3306 \
  -e MYSQL_SERVICE_DB_NAME=nacos \
  -e MYSQL_SERVICE_USER=root \
  -e MYSQL_SERVICE_PASSWORD=root \
  -e MYSQL_SERVICE_DB_PARAM="serverTimezone=Asia/Shanghai&characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true"
  nacos/nacos-server:v2.5.0

docker run -d -p 8848:8848 -p 9848:9848 -p 9849:9849 --name nacos -e JVM_XMS=256m -e JVM_XMX=256m -e MODE=standalone -e SPRING_DATASOURCE_PLATFORM=mysql -e MYSQL_SERVICE_HOST=192.168.0.12 -e MYSQL_SERVICE_PORT=3306 -e MYSQL_SERVICE_DB_NAME=nacos -e MYSQL_SERVICE_USER=root -e MYSQL_SERVICE_PASSWORD=134 -e MYSQL_SERVICE_DB_PARAM="serverTimezone=Asia/Shanghai&characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true" nacos/nacos-server:v2.5.0
```
- 管理页面地址 http://localhost:8848/nacos

---

<u>创建服务</u> ：
- 保护阈值 ：保护阈值是一个 0 ~ 1 之间的值，当服务有 10 个实例时，如果设置为 0.1 ，表示当 10 个实例挂了 9 个，只剩 1 个时，nacos 会将流量分发到 10 个实例上（~~即使有 9 个不可用，也会这么做，因为如果不这么做所有的流量都会压到 1 个实例上，可能会导致 10 个都挂掉，继而导致调用这个服务的上游服务累积流量，最终也挂掉~~）

## 💛 Client

> [!warning] 如果需要引入 Dubbo ，则无需引入 Nacos Client

<u>引入依赖</u> ：
- 使用封装了特定的 grpc 版本的 nacos
```xml
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-client</artifactId>
    <version>2.5.0</version>
</dependency>
```
- 使用不带 grpc 的 纯净版 nacos
```xml
 <dependency>
	<groupId>com.alibaba.nacos</groupId>
	<artifactId>nacos-client</artifactId>
	<version>2.5.0</version>
	<classifier>pure</classifier>
</dependency>
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-common</artifactId>
    <version>2.5.0</version>
</dependency>
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-api</artifactId>
    <version>2.5.0</version>
</dependency>
```

<u>添加配置</u> ：
- ConfigService 配置中心服务
	- 从 Nacos Server 动态获取应用配置（数据库连接、功能开关 ……）
	- 无需重启服务的热更新配置 ：监听配置变更并实时更新应用配置
- NamingService 服务发现服务
	- 服务注册 ：将当前服务实例注册到 Nacos Server
	- 服务发现 ：查询其他服务的可用实例列表

```yml
nacos:
  serverAddr: 192.168.0.12:8848  # nacos的地址
  namespace: f1680a4a-b6f6-49ec-a747-aa35a219570a  # nacos的命名空间（可以为空）
```

```java
@Value("${nacos.serverAddr}")  
private String serverAddr;  
@Value("${nacos.namespace}")  
private String namespace;

/**
 * 配置中心服务
 */
@Bean
public ConfigService configService() throws NacosException {
	Properties properties = new Properties();
	properties.put(PropertyKeyConst.SERVER_ADDR, serverAddr);
	if (!namespace.isEmpty()) properties.put(PropertyKeyConst.NAMESPACE, namespace);

	return NacosFactory.createConfigService(properties);
}

/**
 * 服务发现服务
 */
@Bean
public NamingService namingService() throws NacosException {
	Properties properties = new Properties();
	properties.put(PropertyKeyConst.SERVER_ADDR, serverAddr);
	if (!namespace.isEmpty()) properties.put(PropertyKeyConst.NAMESPACE, namespace);

	return NacosFactory.createNamingService(properties);
}
```

### 💙 ConfigService
[api 文档](https://nacos.io/docs/latest/manual/user/java-sdk/usage/?spm=5238cd80.2ef5001f.0.0.3f613b7c8e69FZ#3-%E9%85%8D%E7%BD%AE%E7%AE%A1%E7%90%86-api)

### 💙 NamingService
[api 文档](https://nacos.io/docs/latest/manual/user/java-sdk/usage/?spm=5238cd80.2ef5001f.0.0.3f613b7c8e69FZ#4-%E6%9C%8D%E5%8A%A1%E5%8F%91%E7%8E%B0api)

---

如果注册 Nacos 的 client 节点注册时 `ephemeral=true`，那么 Nacos 集群对这个 client 节点的效果就是 AP，采用 distro 协议实现；而注册 Nacos 的 client 节点注册时 `ephemeral=false`，那么 Nacos 集群对这个节点的效果就是 CP 的，采用 Raft 协议实现。根据 client 注册时的属性，AP、CP 同时混合存在，只是对不同的 client 节点效果不同。Nacos 可以很好的解决不同场景的业务需求。

```java
# false为永久实例，true表示临时实例开启，注册为临时实例，默认是true
spring.cloud.nacos.discovery.ephemeral=true
```





