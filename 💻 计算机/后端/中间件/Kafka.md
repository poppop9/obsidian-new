
> [!quote] Kafka
> 
> Kafka 的功能很多：
> 
> - 消息引擎 - Kafka 可以作为一个消息引擎系统
> 
> - 流处理 - Kafka 可以作为一个分布式流处理平台
> - 存储 - Kafka 可以作为一个安全的分布式存储

# ❤️ Broker

> [!quote] Broker
> 一个独立的 Kafka 服务器被称为 Broker，一个 Kafka 集群会有多个 Broker

# ❤️ 三级结构
![600](https://s21.ax1x.com/2024/08/01/pkXlN8O.png)

## 💛 主题 Topic

> [!quote] Topic
> Topic 是用来给 Partition 做分类的，一个 Topic 可以有多个 Partition
> 
> - 不同 Topic 的消息是物理隔离的
> - <u>同一个主题的消息可以保存在一个，或多个 Broker 上</u>

## 💛 分区 Partition

> [!quote] Partition
> Partition 是一个有序不变的消息序列，消息以追加的方式写入 Partition，然后以先入先出的顺序读取
> 
> - Partition 提供了负载均衡的能力，~~同一个 Topic 的消息由于 Partition ，可以被分配到多个 Broker 上~~，~~也由于 Partition ，同一个 Topic 可以被多个生产者和消费者同时操作~~
> - 一个 Partition ，在同一个时间内，只容许最多一个生产者，和最多一个消费者的操作

### 💙 分区策略

> [!quote] 分区策略
> 分区策略 是决定生产者将消息发送到哪个分区的算法
> 
> - Kafka 有默认的分区策略，也可以自定义

<u>默认的分区策略</u> ：
- `如果 ProducerRecord 指定了 Partition` ：则发送消息到指定分区
- `如果 ProducerRecord 没有指定 Partition` 
	- `指定了 key` ：根据 key 求 hash 值，然后将 hash 值对 partition 数量取模。【~~由于要保证同一个 key 会被映射到同一 Partition 上，所以在对 Partition 的数量取模时，这个数量是所有的 Partition 的数量，而不是可用的 Partition 的数量~~，~~但是这又会导致另一个问题，如果分配给消息的分区是不可用的，那就会失败，需要生产者使用一些机制来处理~~】
	- `没有指定 key` ：每隔一段时间，随机选择一个 partition。在某个时间段内的所有消息都发送到这个 partition，如果发送出错，那就重新选择一个 partition

### 💙 分区再均衡 Rebalance

> [!quote] 分区再均衡
> kafka 会为一个消费者组里的所有消费者分配分区，这就是**均衡**，但如果达到触发条件，那 Broker 会触发分区再均衡，重新为每一个消费者分配分区，这就是**分区再均衡**
> ![650](https://s21.ax1x.com/2024/08/01/pkX8gG6.png)
> 
> - <u>触发 Rebalance 的三个条件</u>，~~有一个满足则触发~~
> 	- 消费者组成员数变更
> 		- 消费者宕机：长时间未心跳
> 	- 消费者组订阅的 Topic 数变更
> 	- 消费者组订阅的 Topic 的 Partition 数变更，包括副本数变更

---

> [!NOTE] Rebalance 期间，消费者无法读取消息

> [!NOTE] 分区再均衡的代价很高，应该尽量避免，以整体提高 Consumer 的吞吐量

## 💛 消息 Message

> [!quote] Message
> Message 就是 Kafka 的数据单元，由字节数组组成

# ❤️ 生产者

> [!quote] Producer
> Producer 是向 Topic 发布 Message 的 Kafka 客户端，发送的是 `ProducerRecord` 数据对象，里面有 4 个关键参数：
> - `Topic` - 主题
> - `Partition` - 分区（非必填）
> - `Key` - 键（非必填）
> 	- 作为消息的附加信息
> 	- 用来决定消息的分区
> - `Value` - 值

---

> [!quote] 批次
> 批次 是一组消息，<u>是对于 Producer 来说的</u>，在消息发送到服务端之前，会将要发送到同一主题下同一分区下的消息打包成一个批次，统一发送到 Kafka 服务端

## 💛 解压缩

> [!quote] 压缩
> Kafka 的压缩会有三个阶段 ：<u>Producer 压缩</u> -> <u>Broker 保持</u> -> <u>Consumer 解压缩</u>
> 
> - **Kafka 默认不会开启压缩**

---

<u>压缩算法</u> ：
- 在吞吐量方面【~~压缩速度~~】：LZ4 > Snappy > zstd ，GZIP
- 在压缩比方面，zstd > LZ4 > GZIP > Snappy

> [!NOTE] 如果客户端 CPU 资源有很多富余，建议开启 zstd 压缩，这样能极大地节省网络资源消耗

## 💛 事务
开启事务的前提是开启幂等性

[https://dunwu.github.io/bigdata-tutorial/kafka/Kafka%E7%94%9F%E4%BA%A7%E8%80%85.html#_8-kafka-%E4%BA%8B%E5%8A%A1](https://dunwu.github.io/bigdata-tutorial/kafka/Kafka%E7%94%9F%E4%BA%A7%E8%80%85.html#_8-kafka-%E4%BA%8B%E5%8A%A1)

### 💙 幂等性
[https://dunwu.github.io/bigdata-tutorial/kafka/Kafka%E7%94%9F%E4%BA%A7%E8%80%85.html#_7-%E5%B9%82%E7%AD%89%E6%80%A7](https://dunwu.github.io/bigdata-tutorial/kafka/Kafka%E7%94%9F%E4%BA%A7%E8%80%85.html#_7-%E5%B9%82%E7%AD%89%E6%80%A7)

# ❤️ 消费者

> [!quote] 消费者 Consumer
> 消费者 是从 Topic 订阅 Message 的 Kafka 客户端，消费者通过检查消息的 <u>offset</u> 来区分消息是否已读
> 
> - 一个消费者可以消费多个 Partition

> [!quote] 消费者组
> 消费者组 由多个 Consumer 共同构成，同时消费同一个 Topic 下的多个 Partition 以实现高并发
> 
> - 每个消费者只属于一个特定的消费者群，如果不为消费者指定消费者组，则属于默认的群组
> - 在同一时间内，一个消费者组可以消费多个 Topic，一个 Consumer 可以消费多个 Partition
> - 在同一时间内，一个 Partition，只能被一个消费者组中的一个 Consumer 消费
> - 在同一时间内，一个 Topic 可以被多个消费者组消费

> [!quote] 独立消费者
> 独立消费者 就是没有消费者组的消费者，它为自己分配分区
> 
> - 一旦消费者成为独立消费者就不能再加入 Consumer Group

---

> [!quote] 消息偏移量 Offset
> Offset 表示分区中每条消息的位置信息
> 
> - <u>对于 Consumer</u> ：Offset 对于消费者来说是单调递增的，消费者消费到哪条消息，他会记录下这条消息的偏移量，这个偏移量一定是单调递增的
> - <u>对于 Message</u> ：Offset 对于消息自身来说是不可变的，进入 Partition 的第一条消息的 Offset 是 0，后续依次加 1，永远不变

## 💛 消费流程
<u>Consumer 通过 poll() 来获取消息，其中有两个影响因素</u> ：
- poll (time) ：如果在这个 time 内，消费者没有等到消息到来，就会返回一个空消息集合，但也并不是一有消息来就返回
- Broker 数据积累 ：Broker 会将数据积累到一定量之后再返回给消费者

> 举个例子，如果 time 为 300000 ms，数据积累值为 50 条消息，在 300000 ms 内：数据没有积累到 50 条不会返回；只要一到 300000 ms ，不管数据积累了多少都会返回

## 💛 心跳机制

> [!quote] 心跳机制
> 心跳 由消费者使用 poll() 定期发送给协调器 Coordinator ，以告知其仍然存活，如果 Coordinator 发现有消费者宕机了，会再均衡
> 
> <u>心跳的发送频率由以下几个配置参数控制</u> ：
> - `heartbeat.interval.ms` 设置消费者发送心跳的间隔时间
> - `session.timeout.ms` 设置群组协调器等待消费者心跳的最大时间，这个时间应该远大于 `heartbeat.interval.ms` 如果在这个时间内没有接收到消费者的心跳，则认为消费者已经失效，并触发再均衡

> [!quote] 协调器 Coordinator
> Coordinator 是 Broker 中的组件，负责管理消费者组，提供位移管理，Rebalance
> 
> - 一个消费者组只有一个 Coordinator

## 💛 提交 Offset
### 💙 自动提交



### 💙 手动提交


# ❤️ 集群





# ❤️ 可靠传输

# ❤️ 文件存储
Kafka 有两种清理策略 ：
- 默认会保留消息 7 天
- 基于日志大小清理。如果日志的总大小超过某个阈值，就会开始清理旧消息

---

# ❤️ 可视化
Offset Explorer






















