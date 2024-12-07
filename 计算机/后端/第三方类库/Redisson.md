引入 Redis 主要就是两方面的作用：
- <u>用作缓存</u>，比较简单，所有框架差距不大
- <u>用作分布式锁</u>，Redisson 的分布式锁功能比较完善，有很多功能不用手写，有现成的直接用【RedLock 算法，读写锁，上锁后自动续期的 watchDog ……】

>[!hint] 技术选型
>- `Jedis` 
>- `Lettuce`
>- `Redisson` 基于 NIO【~~非阻塞的~~】 的 netty 框架

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.32.0</version>
</dependency>
```

---

- [教程1](https://blog.csdn.net/A_art_xiang/article/details/125525864?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171964322916800222820133%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171964322916800222820133&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-125525864-null-null.142^v100^pc_search_result_base5&utm_term=redisson&spm=1018.2226.3001.4187) 非常全面
- [简化教程](https://blog.csdn.net/black_pp/article/details/131836775?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171964322916800222820133%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171964322916800222820133&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-2-131836775-null-null.142^v100^pc_search_result_base5&utm_term=redisson&spm=1018.2226.3001.4187) 
- [精化教程](https://www.cnblogs.com/xfeiyun/p/17795581.html)

# 配置
- 添加 redis 配置
```yml
# Redis  
redis:  
  sdk:  
    config:  
      host: 127.0.0.1  
      port: 6379  
      pool-size: 10  
      min-idle-size: 5  
      idle-timeout: 30000  
      connect-timeout: 5000  
      retry-attempts: 3  
      retry-interval: 1000  
      ping-interval: 60000  
      keep-alive: true
```

- 添加配置类 `RedissonConfig` 
```java
package app.xlog.ggbond.config;  

@Configuration  
public class RedissonConfig {  
    @Bean  
    public RedissonClient redissonClient() {  
        Config config = new Config();  
  
        //设置redis的地址，这里是单机模式  
        config.useSingleServer()  
                .setAddress("redis://127.0.0.1:6379")  
//                .setPassword(……)  
                // 设置连接池的大小，默认为64  
                .setConnectionPoolSize(64)  
                // 设置连接池的最小空闲连接数，默认为10  
                .setConnectionMinimumIdleSize(10)  
                // 设置连接的最大空闲时间（单位：毫秒），超过该时间的空闲连接将被关闭，默认为10000  
                .setIdleConnectionTimeout(10000)  
                // 设置连接超时时间（单位：毫秒），默认为10000  
                .setConnectTimeout(10000)  
                // 设置连接重试次数，默认为3  
                .setRetryAttempts(3)  
                // 设置连接重试的间隔时间（单位：毫秒），默认为1000  
                .setRetryInterval(1000)  
                // 设置定期检查连接是否可用的时间间隔（单位：毫秒），默认为0，表示不进行定期检查  
                .setPingConnectionInterval(0)  
                // 设置是否保持长连接，默认为true  
                .setKeepAlive(true);  
                
	    // 设置Redisson存储数据的格式，这里使用Json，一定要配置，防止乱码 
		config.setCodec(new JsonJacksonCodec());
  
        return Redisson.create(config);  
    }  
}
```

# 使用
>[!hint] RedissonClient 对象获取任何其他对象，如果不存在，也不会报 null，也只会返回一个空的对象，不用担心空指针

## 💛 Key
- RedissonClient 下的方法
	- `RKeys getKeys();` 返回 RKeys 对象

---

- RKeys 下的方法
	- **删**
		- `delete(键 ……)` 单/多删
		- `deleteByPattern()` 模糊删
	- **查**
		- `getKeys()` 返回所有 key 集合
		- `getKeysByPattern(模糊匹配)` 根据模糊匹配条件，返回所有 key 集合
			- `*` 匹配 0 个或多个字符
			- `?` 匹配单个字符
			- `[]` 匹配指定字符范围内的单个字符
		- `randomKey()` 随机获取 key
		- `count()` 统计 key 的数量
		- `countExists(键)` 判断 key 是否存在

---

```java
@Autowired  
private RedissonClient redissonClient;

@Test
public void testRedisson() {
	RKeys keys = redissonClient.getKeys();
	//获取所有key值
	keys.getKeys().forEach(System.out::println);
	System.out.println("====================================");

	//模糊获取key值
	keys.getKeysByPattern("*sys*").forEach(System.out::println);

	// 删除key
	keys.delete("sys1111", "2222_sys2222");

	// 判断key是否存在
	System.out.println(keys.countExists("awards"));

	// 获取key的数量
	System.out.println(keys.count());
}
```

## 💛 字符串 / 对象 RBucket
- redissonClient 下的方法
	- `getBucket(键)` 获取对应 key 的 RBucket 对象
- RBucket 对象下的方法
	- `set(值)` 设置 value，如果 key 存在则覆盖
	- `Boolean trySet(值)` 设置 value，<u>如果 key 存在则设置不成功，则返回 false，否则返回 true</u>
	- **删**
		- `delete()` 删除键值对
	- **查**
		- `get()` 查询 key 对应的 value
		- `isExists()` 判断 RBucket 对象是否存在【~~不能直接通过是否为 null 来判断，因为即使不存在对应的 key，查出来的 RBucket 对象也不为 null~~】

---

- 字符串
```java
// 使用myStringKey作为key，创建bucket对象
RBucket<String> bucket = redissonClient.getBucket("myStringKey");

// 存储字符串
bucket.set("Hello, Redisson!");

// 获取字符串
System.out.println("Stored value: " + bucket.get());
```

- 对象
```java
TestUser testUser = new TestUser(1, "harvey", 32);
TestUser testUser2 = new TestUser(2, "tom", 32);

//用TestUser的id作为key
RBucket<TestUser> bucket = redissonClient.getBucket("user:id:" + testUser.getId());
bucket.set(testUser);

//删除
RBucket<TestUser> bucket3 = redissonClient.getBucket("user:id:" + testUser.getId());
System.out.println(bucket3.delete());
```

### 💙 批量处理
```java
// 创建 Buckets
RBuckets buckets = redissonClient.getBuckets();

// 创建map集合，存储键值对
Map<String, TestUser> userMap = new HashMap<>();
userMap.put("user:id:" + testUser.getId(), testUser);
userMap.put("user:id:" + testUser2.getId(), testUser2);

buckets.set(userMap);

// 批量获取 value
Map<String, TestUser> bucketsMap = buckets.get("user:id:" + testUser.getId(), "user:id:" + testUser2.getId());

System.out.println(bucketsMap);
```

## 💛  列表 List
- RedissonClient 下的方法
	- `getList(键)` 生成 RList 对象
- RList 下的方法
	- **增**
		- `add(值)` 向 List 中添加值
		- `addAll(集合)` 批量添加
	- **删**
		- `romove(索引)` 删除集合中的指定索引的元素
		- `romove(值)` 删除集合中的指定值的元素

>[!hint] 可以直接把 `RList` 看成 Java 里的 `List 集合`

---

```java
// 构建集合
List<AwardBO> AwardBOs = Stream.of(
		new AwardBO(1, 1, 1, 0.1f),
		new AwardBO(1, 2, 1, 0.2f),
		new AwardBO(1, 3, 1, 0.3f)
).toList();

// 生成 RList
RList<Object> rList = redissonClient.getList("testList");

rList.addAll(AwardBOs);

rList.forEach(System.out::println);
```

## 💛  哈希 RMap
```java
@Autowired  
private RedissonClient redissonClient;

// 会在redis中创建名为awards的HASH数据结构，然后存储以下三个数据
@Test
public void testRedisson() {
	RMap<String, String> rMap = redissonClient.getMap("awards");
	rMap.put("101", "随机积分");
	rMap.put("102", "淘宝优惠券");
	rMap.put("103", "京东优惠券");

	// 通过key获取value
	System.out.println(redissonClient.getMap("awards").get("102"));
}

---
淘宝优惠券
```

## 💛  布隆过滤器 RBloomFilter
- `RBloomFilter getBloomFilter(key)` 根据 key 创建 RBloomFilter 对象
- RBloomFilter
	- `tryInit(预期数据量，误报率)` 误报率越小，过滤器所需的空间越大
	- `isExists()` 判断这个过滤器原来是否存在
	- `delete()` 删除这个布隆过滤器
	- `add(元素)` 向布隆过滤器中添加元素，或集合
	- `expire(过期时间，过期单位)` 意味着如果在指定时间内，没有操作布隆过滤器，那 redis 将会删除该布隆过滤器
	- `Boolean contains(元素)` 判断该元素是否在布隆过滤器中

```java
// 创建
RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("BlacklistUserList");  
// 删除旧的布隆过滤器  
if (bloomFilter.isExists()) {  
    bloomFilter.delete();  
}  

bloomFilter.tryInit(100000L, 0.03);
bloomFilter.add(List.of(404L));
```

```java
// 测试
@Test
void test_849() {
	RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("BlacklistUserList");
	System.out.println(bloomFilter.contains(404L));
	System.out.println(bloomFilter.contains(404L));
	System.out.println(bloomFilter.contains(101L));
	System.out.println(bloomFilter.contains(101L));
}

true
true
false
false
```

## 💛  原子长整型 AtomicLong
>[!quote] AtomicLong
>AtomicLong 是一个分布式原子 long，是一个线程安全对象
>
>- 如果需要在多线程环境中维护一个 long 变量，可以使用
>- 需要实现高性能的计数器，可以使用
>- <u>想要避免加锁，来提高性能时</u>，可以使用

---

- `RAtomicLong getAtomicLong(键)` 获取 RAtomicLong 对象
	- **改**
		- `set(值)` 设置值
		- `long incrementAndGet()` 递增，并返回新的值
		- `long decrementAndGet()` 递减，并返回新的值
		- `long addAndGet(值)` 将 redis 中的值加上指定值，然后返回
	- **查**
		- `long get()` 获取值

```java
@Test
public void test_getAtomicLong() {
	RAtomicLong rAtomicLong = redissonClient.getAtomicLong("testAtomicLong");

	rAtomicLong.set(100);
	log.atInfo().log("当前值: {}", rAtomicLong.get());

	rAtomicLong.incrementAndGet();
	log.atInfo().log("自增后的值: {}", rAtomicLong.get());
	
	rAtomicLong.decrementAndGet();
	log.atInfo().log("自减后的值: {}", rAtomicLong.get());

	long l = rAtomicLong.addAndGet(-100);
	log.atInfo().log("加-100后的值: {}", l);
}


当前值: 100
自增后的值: 101
自减后的值: 100
加100后的值: 0
```

## 💛  队列
### 💙 队列 RQueue
>[!quote] RQueue
>RQueue 是一个分布式的、线程安全的队列接口

- `RQueue<?> getQueue(键)` 
	- **增**
		- `add(值)` 将值添加到队列尾部
	- **删查**
		- `poll()` 移除并返回 Queue 头部的元素，如果队列为空则返回 `null`
		- `peek()` 返回队列头部的元素但不移除，如果队列为空则返回 `null` 

```java
RQueue<String> queue = redissonClient.getQueue("myQueue");
queue.add("firstElement");
String elementA = queue.peek();
String elementB = queue.poll();
```

#### 💚 监听器
- `TrackingListener` 当你从队列中读取元素之后，如果紧接着发生了元素的创建、删除或更新操作，就会触发事件
- `ListAddListener` 当元素被创建时触发
- `ListRemoveListener` 当元素被删除时触发
- `ExpiredObjectListener` 当 RQueue 对象过期时触发
- `DeletedObjectListener` 当 RQueue 对象被删除时触发

```java
RQueue<String> queue = redisson.getQueue("anyList");

int listenerId = queue.addListener(new DeletedObjectListener() {
     @Override
     public void onDeleted(String name) {
        sout(name);
     }
});

// ...

queue.removeListener(listenerId);
```

### 💙 阻塞队列 RBlockingQueue
>[!quote] RBlockingQueue
>RBlockingQueue 支持阻塞操作，在队列为空，或已满的情况下，操作可以被阻塞
>
>- 不适合需要高吞吐量的场景

- `RBlockingQueue<?> getBlockingQueue(键)` 获取阻塞队列对象
	- **增**
		- `put(值)` 将元素添加到队列尾部，如果队列已满，则线程阻塞，直到队列中有空位
		- `Boolean offer(值，时间值，时间单位)` 将元素添加到队列尾部，如果队列已满，则等待指定的时间，如果队列还是满的，则返回 false
	- **删/查**
		- `take()` 移除并返回队列头部的元素，如果队列为空，则阻塞，直到有元素可用 
		- `poll(时间值，时间单位)` 移除并返回队列头部的元素，如果队列为空则等待指定的时间

```java
RBlockingQueue<String> blockingQueue = redissonClient.getBlockingQueue("myBlockingQueue");
blockingQueue.put("firstElement");
String element = blockingQueue.take(); // 如果队列为空则等待
```

### 💙 延迟队列 DelayedQueue
>[!quote] DelayedQueue
>DelayedQueue 允许你将元素按照一定的时间间隔【~~时间可以固定，也可以动态变化~~】添加到队列中
>
>- 通过延时处理，可以减轻某个组件的负载

---

- `RDelayedQueue getDelayedQueue(RQueue<?>)` 从队列中获取 RDelayedQueue 延迟队列对象
	- **增**
		- `offer(值，延迟时间，延迟时间单位)` 添加元素到延迟队列
	- **查**
		- `poll()` 取出延迟队列中的元素
		- `isEmpty()` 判断延迟队列是否为空

```java
/*
元素一开始就会被加入到rDelayedQueue中，在3s后该元素会被转移到rQueue中，然后rDelayedQueue会将该元素删除
*/

// 建立队列  
RQueue<Object> rQueue = redissonClient.getQueue("strategy_" + strategyId + "_awards_DecrQueue");  
RDelayedQueue<Object> rDelayedQueue = redissonClient.getDelayedQueue(rQueue);  
  
// 写入队列  
DelayedDecrVO delayedDecrVO = DelayedDecrVO.builder()  
        .strategyId(strategyId)  
        .awardId(awardId)  
        .build();  
rDelayedQueue.offer(delayedDecrVO, 3, java.util.concurrent.TimeUnit.SECONDS);
```



