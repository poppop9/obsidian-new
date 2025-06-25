MongoDB 是一个文档型的非关系型数据库，它使用类似 JSON 的文档模型存储数据，这使得数据存储变得非常灵活，尤其适合处理大量的半结构化或非结构化数据。
- 文档导向：MongoDB 存储 BSON（二进制 JSON）文档，这些文档可以包含复杂的数据结构，如数组和嵌套对象
- 高性能：特别是对于写入密集型的应用
- 水平扩展：通过分片技术，MongoDB 可以在多个服务器之间分布数据，实现水平扩展
- 灵活的聚合框架：允许执行复杂的数据处理和聚合操作
- 丰富的查询语言：MongoDB 的查询语言（MQL）支持丰富的查询操作，包括内嵌对象和数组的查询、文本搜索、地理位置查询 ……
- 存储过程：MongoDB 支持在数据库内部执行 JS 代码，允许定义和执行复杂的数据处理逻辑
- GridFS：用于存储和检索大于 BSON 文档大小限制的文件，如图片和视频
- 索引优化查询：MongoDB 允许用户为文档中的任意属性创建索引，例如 FirstName 和 Address，从而提高查询效率和排序性能

# ❤️ 安装部署
```
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin \
  mongodb/mongodb-community-server:7.0.18-ubuntu2204

docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin mongodb/mongodb-community-server:7.0.18-ubuntu2204
```

# ❤️ 数据结构
MongoDB 使用集合来组织文档，每个文档都由键值对组成 ：
- 数据库 Database ：存储数据的容器（数据库）
- 集合 Collection ：数据库中的一个集合（表）
- 文档 Document ：集合中的一个数据记录（行），以 BSON 格式存储
- 域名 field ：就是数据字段
- 主键 ：MongoDB 自动将 `_id` 字段设置为主键

## 数据库
<u>初始化的数据库</u> ：
- admin ：要是将一个用户添加到这个数据库，这个用户自动继承所有数据库的权限。一些特定的服务器端命令也只能从这个数据库运行，比如列出所有的数据库或者关闭服务器
- local ：这个数据永远不会被复制，可以用来存储限于本地单台服务器的任意集合
- config ：当 Mongo 用于分片设置时，config 数据库在内部使用，用于保存分片的相关信息

如果在操作时没有指定数据库，MongoDB 会使用一个名为 test 的默认数据库，该数据库存储在 data 目录中

# ❤️ GUI
[https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)






