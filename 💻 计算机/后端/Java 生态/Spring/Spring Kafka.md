[https://juejin.cn/post/7373937820178169894](https://juejin.cn/post/7373937820178169894)

[https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages/listener-annotation.html#manual-assignment](https://docs.spring.io/spring-kafka/reference/kafka/receiving-messages/listener-annotation.html#manual-assignment)

```xml
<!-- spring-kafka 封装了 kafka-clients，简化开发 -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
    <version>3.3.1</version>
</dependency>
```

# ❤️ 规则
<u>命名规则</u> ：
- Topic 为 `-` 分割的全小写名称，~~例如 模块名 -Test~~
- 消费者 groupId 为 `_` 分割的全小写名称，~~例如~~

# ❤️ Broker
```bash
docker run -d \
  --name kafka \
  -p 9092:9092 \
  -p 9093:9093 \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_INTER_BROKER_LISTENER_NAME=BROKER \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_CFG_LISTENERS=BROKER://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=BROKER://localhost:9092,CONTROLLER://localhost:9093 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,BROKER:PLAINTEXT \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
  -e KAFKA_KRAFT_CLUSTER_ID=big-market-cluster \
  bitnami/kafka:3.9.0

docker run -d --name kafka -p 9092:9092 -p 9093:9093 -e KAFKA_CFG_NODE_ID=0 -e KAFKA_CFG_PROCESS_ROLES=controller,broker -e KAFKA_CFG_INTER_BROKER_LISTENER_NAME=BROKER -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER -e KAFKA_CFG_LISTENERS=BROKER://:9092,CONTROLLER://:9093 -e KAFKA_CFG_ADVERTISED_LISTENERS=BROKER://localhost:9092,CONTROLLER://localhost:9093 -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,BROKER:PLAINTEXT -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 -e KAFKA_KRAFT_CLUSTER_ID=big-market-cluster bitnami/kafka:3.9.0

---

- KAFKA_CFG_NODE_ID=0  # 节点 ID，单节点配置为 0- KAFKA_CFG_PROCESS_ROLES=controller,broker  # 同时作为 controller 和 broker- KAFKA_CFG_INTER_BROKER_LISTENER_NAME=BROKER  # 设置 broker 监听器名称  
- KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER  # 设置 controller 监听器名称  
- KAFKA_CFG_LISTENERS=BROKER://:9092,CONTROLLER://:9093  # 设置broker和controller监听器的端口  
- KAFKA_CFG_ADVERTISED_LISTENERS=BROKER://localhost:9092,CONTROLLER://localhost:9093  # 广告监听器，确保外部可以访问 broker- KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,BROKER:PLAINTEXT  # 使用 PLAINTEXT 协议  
- KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093  # 控制器选举设置，单机模式只需一个节点  
- KAFKA_KRAFT_CLUSTER_ID=big-market-cluster  # 设置集群ID
```

# ❤️ Client
## 💛 配置准备
- `bootstrap-servers` 不建议把集群中所有的 Broker 信息都配置到 bootstrap.servers 中，因为 Producer 一旦连接到集群中的任意一台 Broker，就能拿到整个集群的 Broker 信息
- `producer` 
	- `acks` 
		- 0 - 发送消息后，不需要等待任何确认，就会认为消息发送成功
		- 1 - 发送消息后，会等待主分区副本的确认。只有在主副本确认接收到消息时，生产者才会认为消息已成功发送
		- -1 - 生产者在发送消息后，会等待所有副本的确认
- `key-serializer` 如果需要序列化对象，要使用 org.springframework.kafka.support.serializer.JsonSerializer

```yml
spring:
  kafka:
    bootstrap-servers: localhost:9092  # kafka的地址
    producer:  # 生产者配置
	  acks: 1  # 只有在主副本确认时，生产者才认为消息已成功发送
      retries: 1   # 发送消息失败时，重试的次数
      batch-size: 16384   # 生产者在发送批次之前可以积累的最大字节数
	  key-serializer: org.springframework.kafka.support.serializer.JsonSerializer  # 消息键的序列化器
	  value-serializer: org.springframework.kafka.support.serializer.JsonSerializer  # 消息值的序列化器
      properties:
        linger.ms: 0  # 生产者在发送批次之前等待更多消息的时间
        buffer-memory: 33554432  # 生产者可以使用的缓冲区内存大小
    consumer:  # 消费者配置
      properties:
        group.id: defaultConsumerGroup   # 消费组的id
        # 偏移量
        enable-auto-commit: true    # 自动提交偏移量
        auto.commit.interval.ms: 1000  # 自动提交偏移量的时间间隔
        auto-offset-reset: earliest  # 当没有初始偏移量时，消费者从最早的消息开始消费
        # 心跳机制
        heartbeat.interval.ms: 3000  # 消费者发送心跳的时间间隔
        session.timeout.ms: 120000  # 消费者会话的超时时间
        request.timeout.ms: 180000  # 消费者请求的超时时间
        # poll
        max-poll-records: 50   # 单次poll返回的最大消息数
        max-poll-interval-ms: 5000   # 消费者在两次连续的poll之间可以等待的最大时间，消费者处理数据超过这个时间，会被认定为死亡
        # 反序列化
        key-deserializer: org.springframework.kafka.support.serializer.JsonSerializer  # 消息键的反序列化器
        value-deserializer: org.springframework.kafka.support.serializer.JsonSerializer  # 消息值的反序列化器
#      listener:
#       type: batch  # 消费者将拉取后的数据进行批次处理，而不是逐条处理
```

## 💛 主题
<u>配置</u> ：
- 单机使用：KafkaAdmin 会被自动注入，会读取配置文件的配置
- 集群使用：手动注入多个 KafkaAdmin
```java
@Bean
public KafkaAdmin kafkaAdmin() {
    return new KafkaAdmin(
	    Map.of(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092")
	);
}
```

<u>创建 Topic</u> ：
- 初始化时创建
```
@Component
public class KafkaTopicConfig {
    @Bean
    public KafkaAdmin.NewTopics createTopics() {
        return new KafkaAdmin.NewTopics(
                TopicBuilder.name("TopicThree").build(),
                TopicBuilder.name("TopicFour").build(),
                TopicBuilder.name("TopicFive").build()
        );
    }
}
```
- 运行时动态创建，修改
```java
kafkaAdmin.createOrModifyTopics(
		TopicBuilder.name("TopicOne").build(),
		TopicBuilder.name("TopicTwo").build(),
		TopicBuilder.name("TopicThree").build()
);
```
<u>查看</u> ：
```java
kafkaAdmin.describeTopics("TopicTwo", "TopicThree", "TopicFour")
    .forEach((topicName, topicDescription) -> System.out.println(topicName + "：" + topicDescription));

---
TopicThree：(name=TopicThree, internal=false, partitions=(partition=0, leader=localhost:9092 (id: 0 rack: null), replicas=localhost:9092 (id: 0 rack: null), isr=localhost:9092 (id: 0 rack: null)), authorizedOperations=null)

TopicTwo：(name=TopicTwo, internal=false, partitions=(partition=0, leader=localhost:9092 (id: 0 rack: null), replicas=localhost:9092 (id: 0 rack: null), isr=localhost:9092 (id: 0 rack: null)),(partition=1, leader=localhost:9092 (id: 0 rack: null), replicas=localhost:9092 (id: 0 rack: null), isr=localhost:9092 (id: 0 rack: null)),(partition=2, leader=localhost:9092 (id: 0 rack: null), replicas=localhost:9092 (id: 0 rack: null), isr=localhost:9092 (id: 0 rack: null)), authorizedOperations=null)

TopicFour：(name=TopicFour, internal=false, partitions=(partition=0, leader=localhost:9092 (id: 0 rack: null), replicas=localhost:9092 (id: 0 rack: null), isr=localhost:9092 (id: 0 rack: null)), authorizedOperations=null)
```

## 💛 生产者
<u>注入对象</u> ：
- 单机 ：注入 spring-kafka 的 KafkaTemplate 对象
```java
@Resource
private KafkaTemplate<String, Object> kafkaTemplate;
```
- 集群 ：手动注入
```java
@Bean
public KafkaTemplate<String, String> kafkaTemplate() {
    return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(
		Map.of(
			"bootstrap-servers", "localhost:9092",
			"key-serializer", StringSerializer.class,
			"value-serializer", StringSerializer.class
		)
    ));
}
```

<u>发送消息</u> ：
- `send(主题，数据)` 
- `send(主题，键，数据)` 
- `send(主题，分区，键，数据)` 
- `send(主题，分区，时间戳，键，数据)` 虽然消息默认就有时间戳，但是生产者可以自定义
- ……

## 💛 消费者
```java
@KafkaListener(topics = "test-1", groupId = "consumer_group_1")
public void consumeMessage(ConsumerRecord<?, ?> record) {
	log.info("简单消费：{}，{}，{}，{}", record.topic(), record.partition(), record.key(), record.value());
}
```

# ❤️ 高级特性
## 失败处理
默认情况下，如果消费消息时发生错误，会一直重试，直到消费成功，或达到配置的重试次数

---

<u>异常处理器</u> ：
```java
@Configuration
public class KafkaConfig {
    /**
     * 忽略错误
     */
    @Bean
    public KafkaListenerErrorHandler ignoreErrorHandler() {
        return (message, exception) -> {
            System.err.println("忽略处理错误: " + exception);
            return null;  // 返回 null 或任何需要的默认值
        };
    }
}
```

```java
@KafkaListener(topics = ……,
			   groupId = ……,
			   errorHandler = "ignoreErrorHandler")
public void listen(String message) {
	……
}
```



<u>重试</u> ：



## 延迟队列
Kafka 没有原生的延迟队列，实现方式如下 ：
- Log Retention ：Kafka 允许你为每个 Topic 配置消息的保留策略，包括消息保留的时间 `log.retention.ms` 和保留的最大字节数 `log.retention.bytes`
- Kafka Streams ：

<u>Kafka Streams</u> ：
```java
@Configuration
@EnableKafkaStreams
public class KafkaStreamsConfig {
    @Bean
    public KStream<String, String> kStream(StreamsBuilder streamsBuilder) {
        // 读取输入主题
        KStream<String, String> stream = streamsBuilder.stream("input-topic");

        // 将消息处理逻辑添加到流中
        stream
            .mapValues(value -> {
                // 设置一个延迟时间戳，这里假设为当前时间戳加上延迟
                long delayTime = System.currentTimeMillis() + 10000;  // 10秒后处理
                return value + "-" + delayTime;
            })
            .to("delayed-topic");  // 将处理后的消息发送到另一个主题
        
        return stream;
    }
}
```

# ❤️ 异常
✨️ 如果有序列化异常，记得添加类的无参和有参构造函数


