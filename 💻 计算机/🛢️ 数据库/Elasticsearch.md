Elasticsearch 是一个搜索和分析型数据库

# 📚 docker 安装
- ES 以单节点模式启动
- 关闭安全认证
- 设置 JVM 内存，这里限制最小/最大堆内存都是 512MB，防止吃太多内存
```zsh
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  elasticsearch:9.4.0
```

# 📚 Quick Start
把 ES 想象成一个超级图书馆，每条数据就是书架上的一本书，格式是 JSON，索引就是一个分类书架

🔴 节点 —— ES 也可以集群部署，一台服务器一个节点

🔴 索引 —— ES 的索引相当于 MySQL 的表，是用于归类数据的

🔴 分片（Shard） —— 分片是按照索引来分的，比如 products 索引有 1000 万条数据，拆成 3 个分片，分别存储在 3 台服务器上，这样查询可以并行，3 台同时找，速度是 1 台的 3 倍

🔴 快照 —— 就是**备份**。把某一时刻的数据打包存起来
- 存到本地磁盘 / S3 / OSS 都行
- 出了问题可以恢复到备份时的状态
- 新手阶段不用管，生产环境才需要定期做


# 📚 数据结构
- index —— 数据库 / 表
- document —— 一条记录，是 JSON 格式的。同一个 index 里的 document 可以不完全一样，但最好大体结构一致
- field	字段


# 📚 elasticdump




# 📚 可视化
## 📖 ElasticVue


