https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-jdbc/yaml-config/

[官方博客](https://shardingsphere.apache.org/blog/cn/material/)

https://www.cnblogs.com/sphereex/p/15608235.html

https://www.cnblogs.com/chengxy-nds/p/17513945.html

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
https://shardingsphere.apache.org/document/current/cn/dev-manual/sharding/#shardingalgorithm

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
- `shardingAlgorithms` 给分片算法名定义实际的分片策略

---

### 💙 自定义分布
默认是均匀分布，也就是 A 库有 2 张表，B 库也有 2 张表
```yml
tables:
  t_order:
    actualDataNodes: db0.t_order0, db0.t_order1, db1.t_order2, db1.t_order3, db1.t_order4

---
db0
  ├── t_order0
  └── t_order1
db1
  ├── t_order2
  ├── t_order3
  └── t_order4
```

### 💙 多字段作为分片键
```yml
tableStrategy:
  complex:
	shardingColumn: your_column1,your_column2
	shardingAlgorithmName: t_order_item_inline

t_order_item_inline:
  type: INLINE
  props:
    algorithm-expression: t_order_item_${(your_column1 + your_column2) % 2}
	algorithm-expression: t_order_item_${hashCode(your_column1 + your_column2) % 2}
```

### 💙 autoTables + 预定义分片算法
ShardingSphere 已经定义好了一些常用的分片算法 ：
- INLINE - 自定义 Groovy 表达式
- MOD - 如果生成的 id 不随机，比如都是偶数，那数据的就会集中在某个表
- HASH_MOD - 将 id 哈希处理后，取模
- BOUNDARY_RANGE - 范围分表，~~比如设定 id 为 1~100 的就进入 A 表，100~200 的进入 B 表~~ 
- VOLUME_RANGE - 体积分表，~~设定一个容量 Max，先所有数据往 A 表加，当 A 表的行数接近 Max，并且系统预测到数据量可能剧增时，则会创建一个新表，然后往这个表里加~~ 
- AUTO_INTERVAL - 自动分表，~~当 A0 表的数据过重时，会自动将数据分配一些给 A1 表，当数据过多时，也会自动创建新表~~ 
	- 由系统自动调整，很方便
	- 频繁地迁移数据
	- 难以调试
- INTERVAL - 间隔分表，~~设定一个 Limit 值，所有数据往 A 表加，当 A 表的行数达到 Max 时，系统会创建一个新表，然后往这个表里加~~
- CLASS_BASED - 根据特定字段的值进行分片
- COMPLEX_INLINE - 根据多个特定字段的值进行分片
- HINT_INLINE - 其实不是分片策略，而是查找分片策略，它可以指定系统在查找数据时去哪个分片找

```yml
- !SHARDING  # 数据分片
  autoTables:
    Account: # 逻辑表名
	  actualDataSources: ds_${0..1}
	  shardingStrategy:
	    standard:
		  shardingColumn: id
		  shardingAlgorithmName: HASH_MOD

# 分片算法定义
shardingAlgorithms:
  INLINE:
	type: INLINE
	props:
	  algorithm-expression: Account_${id % 2}
  MOD:
	type: MOD
	props:
	  sharding-count: 4  # 一共4张表，如果是2个数据库，就是每个库两张
  HASH_MOD:
    type: HASH_MOD
    props:
      sharding-count: 4
```

### 💙 默认分库策略
指定默认的分库策略，以复用
```yml
tables:
	……

# 默认的分库策略
defaultDatabaseStrategy:
  standard:
	shardingColumn: id  # 将根据id的值，决定路由到哪个数据库实例
	shardingAlgorithmName: database_def
```

### 💙 绑定表

> [!quote] `bindingTables` 绑定表
> 
> > 绑定表 就是将多张表进行绑定路由，这样多表联查时少了很多种可能性【~~比如 order 表，和 user 表绑定，就会将 order_1 与 user_1 绑定，order_2 与 user_2 绑定，多表联查时对应到 order_1 的数据就会去找 user-1，而不是找 user 的所有物理表~~】
> 
> <u>前提</u>：被绑定的表必须具有相同的分片键（分片字段）和分片算法

```java
tables: ……
bindingTables:
  - t_order, user
```

### 💙 示例
#### 💚 tables 手动配置
```yml
# 规则配置
rules:
  - !SHARDING  # 数据分片
    defaultDatabaseStrategy:  # 默认的分库策略
      standard:
        shardingColumn: user_id
        shardingAlgorithmName: database_inline
    defaultTableStrategy:  # 默认的分表策略
      none:  # 将未配置的表视为单表
    defaultShardingColumn: id  # 默认的分片列名
    defaultKeyGenerateStrategy: # 默认的主键生成策略
      column: id
      keyGeneratorName: SNOWFLAKE
    tables:
      t_order: # 逻辑表名
        actualDataNodes: ds_${0..1}.t_order_${0..1}  # 实际的数据表的位置
        tableStrategy:  # 分表策略
          standard:
            shardingColumn: order_id
            shardingAlgorithmName: t_order_inline
      t_order_item: ……
    # 绑定表
    bindingTables:
      - t_order, t_order_item
    shardingAlgorithms:  # 定义分片算法策略
      database_inline:
        type: INLINE
        props:
          algorithm-expression: ds_${user_id % 2}
      t_order_inline:
        type: INLINE
        props:
          algorithm-expression: t_order_${order_id % 2}
    keyGenerators:  # 定义主键生成策略
      snowflake:
        type: SNOWFLAKE
        props:  
		  worker-id: 1
    auditors:
      sharding_key_required_auditor:
        type: DML_SHARDING_CONDITIONS
```

#### 💚 autoTables 自动配置
```yml
rules:
  - !SHARDING  # 数据分片
    defaultDatabaseStrategy: # 默认的分库策略
      standard:
        shardingColumn: id
        shardingAlgorithmName: database_inline
    defaultTableStrategy:  # 默认的分表策略
      none:  # 将未配置的表视为单表
    defaultShardingColumn: id  # 默认的分片列名
    defaultKeyGenerateStrategy: # 默认的主键生成策略
      column: id
      keyGeneratorName: SNOWFLAKE
    autoTables:
      Account:  # 逻辑表名
        actualDataSources: ds_${0..1}
        shardingStrategy:  # 分表策略
          standard:
            shardingColumn: id
            shardingAlgorithmName: HASH_MOD
    shardingAlgorithms:  # 定义分片算法策略
      HASH_MOD:
        type: HASH_MOD
        props:
          sharding-count: 4
      database_inline:
        type: INLINE
        props:
          algorithm-expression: ds_${id % 2}
    keyGenerators:  # 定义主键生成策略
      SNOWFLAKE:
        type: SNOWFLAKE
        props:
          worker-id: 2
    auditors:
	  sharding_key_required_auditor:
	    type: DML_SHARDING_CONDITIONS
```

## 💛 广播表

> [!quote] 广播表
> 一般会把**需要频繁与其他表进行关联**，并且**数据量不大**的表设置为 广播表【~~字典表，配置表~~】
> 
> <u>特点</u> ：
> - 这个表会在所有数据源中都存在，并且这个表在每个数据源中都完全一致
> - 由于在每个数据源都存在，可以提高查询效率
> 
> <u>不支持广播表的数据库</u> ：MySQL，PgSQL，SQLite，MongoDB

```yml
- !BROADCAST
tables:
  - t_account
```

## 💛 单表

> [!quote] 单表
> 单表 就是不分片的表，在整个数据集群中都唯一存在的表
> 
> ```yml
> - !SHARDING  # 数据分片
>   defaultTableStrategy:  # 默认的分表策略  
>     none:  # 将未配置在此 yml 的表视为单表
> ```

> [!warning] 为什么有数据加密，数据脱敏的表，一般设置为单表 ?
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

> [!quote] 自动加载
> 自动加载 就是 ShardingSphere 会将该表进行统一管理
> 
> <u>好处</u> ：
> - 【动态加载】 ：如果程序正在运行中，你修改了这张表的某个字段，ShardingSphere 会自动跟踪并理解新的表结构，而无需你在 yml 配置文件中重新配置

# 读取 yml 配置
ShardingSphere-JDBC 的 数据源 YAML 配置文件是不能被 Spring 读取的，语法会报错，我们可以通过两种方式读取 ：
- 使用的是 JPA ，直接指定数据源的 url 为此 yml 文件
```yml
spring:
  datasource:
    driver-class-name: org.apache.shardingsphere.driver.ShardingSphereDriver
    url: jdbc:shardingsphere:classpath:application-sharding-databases-tables.yml
  jpa:
    ……
```

- 通过配置类来读取创建数据源
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










