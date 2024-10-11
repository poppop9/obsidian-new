https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-jdbc/yaml-config/

ShardingSphere-JDBC 的 YAML 配置文件组成 ：
- 逻辑数据库
- 运行模式
- 数据源
- 规则
- 属性配置

# ❤️ 逻辑数据库
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20240928150157.png)

```yml
# 逻辑数据库名
databaseName: logic_db
```

# ❤️ 运行模式
<u>单机模式</u> ：
```yml
mode:
  type: Standalone
  repository:
    type: JDBC
    props: 
	  provider: MySQL 
	  jdbc_url: jdbc:mysql://localhost:3306/security
	  username: root
	  password: 134
```

---

<u>集群模式</u> ：**推荐使用集群模式**，并**推荐使用 ZooKeeper**
- 引入持久化仓库依赖
```yml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-cluster-mode-repository-zookeeper</artifactId>
    <version>5.5.0</version>
</dependency>
```

```yml
mode:
  type: Cluster
  repository:
    type: ZooKeeper  # 持久化仓库类型
    props:
      namespace: governance_ds  # 注册中心命名空间
      server-lists: localhost:2181  # 注册中心连接地址
      retryIntervalMilliseconds: 500
      timeToLiveSeconds: 60
      maxRetries: 3
      operationTimeoutMilliseconds: 500
```

# ❤️ 数据源
```yml
# 数据源配置
dataSources:
  ds_0:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ds_0
    username: root
    password: root
  ds_1:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ds_1
    username: root
    password: root
```

# ❤️ 规则
## 💛 数据分片
- `tables` 
	- `databaseStrategy` 分库策略
		- none ~~不指定则为默认~~，不分片
		- standard 单分片键的标准分片场景
			- `shardingColumn` 指定用于分片的列名称
			- `shardingAlgorithmName` 分片算法名称
		- complex 多分片键的复合分片场景
			- `shardingColumns` 多个列名，用逗号分隔
			- `shardingAlgorithmName` 分片算法名称
		- hint 动态选择分片
			- `shardingAlgorithmName` 分片算法名称
	- `tableStrategy` 分表策略，属性同分库策略
		- `standard` 
			- `shardingColumn` **分片键**，指定根据哪个字段分片
			- `algorithm-expression` 分片的表达式
	- `broadcast` 是否设置为广播表【~~这个表会在所有数据源中都存在~~】
		- true 有些高频使用的表需要
		- false
	- `keyGenerateStrategy` 主键生成策略，**会与 ORM 框架有冲突，建议不配置**
		- column 主键列名
		- keyGeneratorName 算法名
	- `auditStrategy` 分片审计策略 ：确保每次数据的修改、插入或删除操作都有记录，便于事后审查和追踪
		- auditorNames 审计算法
		- allowHintDisable 
- `bindingTables` 绑定表【~~绑定前提是这些表的分片字段是相同的~~】，将多张表进行绑定路由，这样多表联查时少了很多种可能性【~~比如 order 表，和 user 表绑定，就会有 order_1 对应 user_1，order_2 对应 user_2，多表联查时对应到 order_1 的数据就会去找 user-1，而不是找 user 的所有物理表~~】

```yml
# 规则配置  
rules:  
  - !SHARDING  # 数据分片  
    tables:  
      t_order: # 逻辑表名  
        actualDataNodes: ds_${0..1}.t_order_${0..1}  # 实际的数据表的位置  
        # 分表策略  
        tableStrategy:  
          standard:  
            shardingColumn: order_id  
            algorithm-expression: t_order_${order_id % 2}  
      t_order_item:  
        actualDataNodes: ds_${0..1}.t_order_item_${0..1}  
        tableStrategy:  
          standard:  
            shardingColumn: order_id  
            algorithm-expression: t_order_item_${order_id % 2}  
      t_account:  
        actualDataNodes: ds_${0..1}.t_account_${0..1}  
        tableStrategy:  
          standard:  
            algorithm-expression: t_account_${account_id % 2}  
		broadcast: true  # 广播表
    defaultShardingColumn: account_id  
    # 绑定表
    bindingTables:  
      - t_order, t_order_item  
    defaultDatabaseStrategy:  
      standard:  
        shardingColumn: user_id  
        algorithm-expression: ds_${user_id % 2}  
    defaultTableStrategy:  
      none:  
    keyGenerators:  
      snowflake:  
        type: SNOWFLAKE  
    auditors:  
      sharding_key_required_auditor:  
        type: DML_SHARDING_CONDITIONS  
  - !BROADCAST  
    tables:  
      - t_address
```

>[!warning] ShardingSphere-JDBC 的 数据源 YAML 配置文件是不能被 Spring 读取的，因为语法会报错，只能通过配置类来读取创建数据源

```java
@Configuration
public class ShardingDataSourceConfig {
    @Bean
    public static DataSource createShardingDataSource() throws IOException, SQLException {
        // 获取 YAML 配置文件
        File yamlFile = new File(ShardingDataSourceConfig.class.getResource("/application-sharding-databases-tables.yml").getFile());
        // 创建数据源
        return YamlShardingSphereDataSourceFactory.createDataSource(yamlFile);
    }
}
```










