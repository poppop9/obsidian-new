MongoDB 是一个文档型的非关系型数据库，它使用类似 JSON 的文档模型存储数据，这使得数据存储变得非常灵活，尤其适合处理大量的半结构化或非结构化数据
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

# ❤️ GUI
[https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

# ❤️ 基本概念
- MongoDB 会为每个文档自动生成的唯一标识符，不需要我们手动管理 (生成、存储与查询)
- 可以为集合中的某些字段设置 TTL，以自动删除旧数据

🧩 初始化的数据库 ：如果在操作时没有指定数据库，MongoDB 会使用一个名为 test 的默认数据库，该数据库存储在 data 目录中
- admin ：要是将一个用户添加到这个数据库，这个用户自动继承所有数据库的权限。一些特定的服务器端命令也只能从这个数据库运行，比如列出所有的数据库或者关闭服务器
- local ：这个数据永远不会被复制，可以用来存储限于本地单台服务器的任意集合
- config ：当 Mongo 用于分片设置时，config 数据库在内部使用，用于保存分片的相关信息

# ❤️ 数据类型
- Object ID：MongoDB 中存储的文档必须有一个 _id 键。这个键的值可以是任何类型的，默认是个 ObjectId 对象。由于 ObjectId 中保存了创建的时间戳，所以你不需要为你的文档保存时间戳字段。这个 id 不是自动递增的
  - ObjectId 类似唯一主键，可以很快的去生成和排序，包含 12 bytes，组成：
    - 前 4 个字节表示创建 unix 时间戳，格林尼治时间 UTC 时间，比北京时间晚了 8 个小时
    - 接下来的 3 个字节是机器标识码
    - 紧接的两个字节由进程 id 组成 PID
    - 最后三个字节是随机数
-  String：字符串，必须是 UTF-8 编码
- Integer：整型数值
- Boolean：布尔值
- Double：双精度浮点数
- Date：日期时间，表示当前距离 Unix 新纪元（1970年1月1日）的毫秒数，负数表示 1970 年之前的日期
- Timestamp：时间戳，用于记录文档添加或修改的时间。前 32 位是一个 time_t 值（与Unix新纪元相差的秒数），后 32 位是在某秒中操作的一个递增的序数
  - 在单个 mongod 实例中，时间戳值通常是唯一的
- Min/Max keys：用于将值与 BSON 的最小值或最大值进行比较
- Array：数组或列表，可以存储多个值
- Object：内嵌文档，用于嵌套结构
- Null：空值
- Symbol：符号类型，类似字符串，一般用于某些特殊语言
- Binary Data：二进制数据
- Code：JavaScript 代码
- Regular Expression：正则表达式

# ❤️ 数据结构
🧩 MongoDB 的数据格式是 BSON (Binary JSON)，是二进制形式的 JSON ：
- 数据库 Database ：存储数据的容器（数据库）
- 集合 Collection ：数据库中的一个集合（表）
- 文档 Document ：集合中的一个数据记录（行），以 BSON 格式存储
- 域名 field ：就是数据字段
- 主键 ：MongoDB 自动将 `_id` 字段设置为主键

## 💛 集合
🧩 集合的注意事项 ：
- 集合名不能是空字符串，也不能含有空字符，这个字符表示集合名的结尾
- 集合名不能以"system."开头，这是为系统集合保留的前缀
- 用户创建的集合名字不能含有保留字符 $

🧩 Capped 集合 ：Capped 集合就是固定大小的集合，单位是字节
- 有很高的性能，以及队列过期特性
- 当我们更新 Capped  集合中文档的时候，更新后的文档不可以超过之前文档的大小（这样才能确保所有文档在磁盘上的位置一直保持不变）
- Capped 集合不能删除部分文档，只能一次性全部删除

## 💛 文档
🧩 文档的注意事项 ：
- 文档中的键值对是有序的
- 文档不能有重复的键
- 文档的键是字符串。除了少数例外情况，键可以使用任意 UTF-8 字符
  - 键不能含有空字符，因为这个字符用来表示键的结尾
  - 和 $ 有特别的意义，只有在特定环境下才能使用
  - 避免使用 _ 开头的键，以免与系统字段冲突

# ❤️ 功能
