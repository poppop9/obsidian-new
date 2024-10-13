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
			- `shardingAlgorithmName` 定义分片策略算法名
	- `keyGenerateStrategy` 主键生成策略，**会与 ORM 框架有冲突，建议不配置**
		- column 主键列名
		- keyGeneratorName 算法名
	- `auditStrategy` 分片审计策略 ：确保每次数据的修改、插入或删除操作都有记录，便于事后审查和追踪
		- auditorNames 审计算法
		- allowHintDisable 
- `bindingTables` 绑定表【~~绑定前提是这些表的分片字段是相同的~~】，将多张表进行绑定路由，这样多表联查时少了很多种可能性【~~比如 order 表，和 user 表绑定，就会有 order_1 对应 user_1，order_2 对应 user_2，多表联查时对应到 order_1 的数据就会去找 user-1，而不是找 user 的所有物理表~~】
- `shardingAlgorithms` 给分片算法名定义实际的分片策略

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
            shardingAlgorithmName: t_order_inline
      t_order_item:
        actualDataNodes: ds_${0..1}.t_order_item_${0..1}
        tableStrategy:
          standard:
            shardingColumn: order_id
            shardingAlgorithmName: t_order_item_inline
      t_account:
        actualDataNodes: ds_${0..1}.t_account_${0..1}
        tableStrategy:
          standard:
            shardingAlgorithmName: t_account_inline
    defaultShardingColumn: account_id
    # 绑定表
    bindingTables:
      - t_order, t_order_item
    defaultDatabaseStrategy:
      standard:
        shardingColumn: user_id
        shardingAlgorithmName: database_inline
    defaultTableStrategy:
      none:
    shardingAlgorithms: # 算法策略总和
      database_inline:
        type: INLINE
        props:
          algorithm-expression: ds_${user_id % 2}
      t_order_inline:
        type: INLINE
        props:
          algorithm-expression: t_order_${order_id % 2}
      t_order_item_inline:
        type: INLINE
        props:
          algorithm-expression: t_order_item_${order_id % 2}
      t_account_inline:
        type: INLINE
        props:
          algorithm-expression: t_account_${account_id % 2}
    keyGenerators:
      snowflake:
        type: SNOWFLAKE
    auditors:
      sharding_key_required_auditor:
        type: DML_SHARDING_CONDITIONS
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

## 💛 广播表
BROADCAST 中可以指定某些表为广播表【~~这个表会在所有数据源中都存在~~】

```yml
- !BROADCAST
tables:
  - t_account
```

## 💛 单表
>[!quote] 单表
>单表 就是不分片的表，在整个数据集群中都唯一存在的表

>[!warning] 为什么有数据加密，数据脱敏的表，一般设置为单表 ?
> 如果一张表的 name 字段被数据加密了，并且字段频繁作为查询条件，以下是查询步骤：
> - 我使用 name = 'Mike' 去查询数据
> - 由于数据库中的数据都是被加密的，数据库会遍历这张表的所有 name 字段的值，进行解密，然后与 Mike 对比，~~所以可以看出，建立索引对于加密的数据是无用的，如果不设置为单表，那将多数据源全部遍历，然后再合起来进行对比~~

---

<u>符合以下条件的单表会被自动加载</u>：
- 如果这张单表配置了数据加密，或数据脱敏
- 通过 ShardingSphere 执行 DDL 语句创建的单表

<u>不自动加载的表，手动配置</u> ：
```yml
- !SINGLE
tables:
  - user_profile
```

>[!quote] 自动加载
>自动加载 就是 ShardingSphere 会将该表进行统一管理
>
><u>好处</u> ：
>- 【动态加载】 ：如果程序正在运行中，你修改了这张表的某个字段，ShardingSphere 会自动跟踪并理解新的表结构，而无需你在 yml 配置文件中重新配置














