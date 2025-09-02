```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.45.1</version>
</dependency>
```

<u>引入 Redis 主要就是两方面的作用</u> ：
- 用作缓存 ：比较简单，所有框架差距不大
- 用作分布式锁 ：Redisson 的分布式锁功能比较完善，有很多功能不用手写，有现成的直接用【RedLock 算法，读写锁，上锁后自动续期的 watchDog ……】

<u>技术选型</u> ：
- `Jedis` 
- `Lettuce` 
- `Redisson` 基于 NIO【~~非阻塞的~~】 的 netty 框架

---

[教程](https://blog.csdn.net/A_art_xiang/article/details/125525864?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522171964322916800222820133%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=171964322916800222820133&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-125525864-null-null.142^v100^pc_search_result_base5&utm_term=redisson&spm=1018.2226.3001.4187)

# 🔧 配置
- 添加 redis 配置
```yml
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
- 添加配置类
```java
package app.xlog.ggbond.config;  

@Configuration  
public class RedissonConfig {  
    @Bean  
    public RedissonClient redissonClient() {  
        Config config = new Config();  
		config.useSingleServer()  // 单机模式  
		        .setAddress(redisAddress)  
		        // .setPassword(……)
		        .setConnectionPoolSize(64)  // 设置连接池的大小，默认为64  
		        .setConnectionMinimumIdleSize(10)  // 设置连接池的最小空闲连接数，默认为10  
		        .setIdleConnectionTimeout(10000)  // 设置连接的最大空闲时间（单位：毫秒），超过该时间的空闲连接将被关闭，默认为10000  
		        .setConnectTimeout(10000)  // 设置连接超时时间（单位：毫秒），默认为10000  
		        .setRetryAttempts(3)  // 设置连接重试次数，默认为3  
		        .setRetryInterval(1000)  // 设置连接重试的间隔时间（单位：毫秒），默认为1000  
		        .setPingConnectionInterval(0)  // 设置定期检查连接是否可用的时间间隔（单位：毫秒），默认为0，表示不进行定期检查  
		        .setKeepAlive(true);  // 设置是否保持长连接，默认为true  
		config.setCodec(JsonJacksonCodec.INSTANCE);  // 设置Redisson存储数据的格式，这里使用Json，一定要配置，防止乱码  
		config.setExecutor(myScheduledThreadPool.getScheduledExecutor());  // 设置redisson核心线程池，不设置默认线程数=cpu核心数*2
		RedissonClient redissonClient = Redisson.create(config);  
		return redissonClient;
    }  
}
```

# 🎯 分布式对象

> [!NOTE] RedissonClient 对象获取任何其他对象，如果不存在，也不会报 null，也只会返回一个空的对象，不用担心空指针

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
	- 过期时间
		- `boolean expire(Instant)` 设置过期时间点
		- `boolean expire(Duration)` 设置相对过期时间

---

<u>字符串</u> ：
```java
// 使用myStringKey作为key，创建bucket对象
RBucket<String> bucket = redissonClient.getBucket("myStringKey");

// 存储字符串
bucket.set("Hello, Redisson!");

// 获取字符串
System.out.println("Stored value: " + bucket.get());
```

<u>对象</u> ：
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

<u>过期时间</u> ：
```java
boolean result = redissonClient.getBucket("myStringKey").expire(
	Instant.parse("2024-12-31T23:59:59Z")
);

boolean result = redissonClient.getBucket("myStringKey").expire(
	Duration.ofHours(1)
);
```

<u>批量处理</u> ：
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

## 实时对象 RLiveObjectService

> [!quote] RLiveObjectService
> RLiveObjectService 支持在 Redis 中直接存储 Java 对象，当某些数据对象需要频繁读写时可以使用
> 
> <u>优点</u> ：
> - 通过 RLiveObject 服务创建或获取的对象是实时的，当修改对象的字段时，RLiveObject 会自动将这些更改同步到 Redis 数据库
> - 由于操作是在对象级别进行的，只有实际更改的字段会被更新到 Redis，而不是传输整个对象，因此可以减少不必要的网络传输
> 
> <u>缺点</u> ：
> - 在大量操作的场景下，动态代理和反射机制可能会引入额外的性能开销
> - 不提供复杂查询

```java
@REntity
public class MyObject {
    @RId
    private String id;
    @RIndex
    private String value;
    private MyObject parent;
}
```

# 👥 分布式集合
## 💛 RList
- RedissonClient 下的方法
	- `RList getList(键)` 生成 RList 对象
- RList 下的方法
	- **增**
		- `add(值)` 向 List 中添加值
		- `addAll(集合)` 批量添加
	- **删**
		- `romove(索引)` 删除集合中的指定索引的元素
		- `romove(值)` 删除集合中的指定值的元素

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

## 💛 Set
### 💙 无序不重复集合 RSet
- 交并补
	- `Set readIntersect(String... var1)` 交集
	- `Set readUnion(String... var1)` 并集
	- `Set readDifference(String... var1)` 补集，A 有 B 五

```java
// 获取集合并计算并集（即所有集合中的商品，去重）
RSet<String> electronics = redissonClient.getSet("products:electronics");
RSet<String> clothing = redissonClient.getSet("products:clothing");
RSet<String> books = redissonClient.getSet("products:books");

Set<String> intersection = electronics.readIntersect(clothing, books);
Set<String> union = electronics.readUnion(clothing, books);
Set<String> difference = electronics.readDifference(clothing);
```

### RSortedSet


### 💙 位图 RBitSet
- `getBitSet()` 
- 【改】
	- `boolean set(long)` 将该位设为 true，返回旧值
	- `clear(long)` 将该位设为 false
	- `set(long, boolean)` 设置第 x 位，为 true / false
	- `set(long1, long2, boolean)` 将第 x 位到第 y-1 位设置为指定 boolean
- 【查】
	- `boolean get(long)` 获取指定位的 boolean
- 【统计】
	- `long cardinality()` 获取 true 的位的数量
	- `long length()` 获取该 RBitSet 的总长（最后一位 + 1）

```java
RBitSet bitSet = redisson.getBitSet("myBitmap");

bitSet.set(0, true); // 设置第0位为1
bitSet.set(1, false); // 设置第1位为0
bitSet.set(2); // 设置第2位为1（简写）

boolean bit0 = bitSet.get(0); // 获取第0位，结果为 true
boolean bit1 = bitSet.get(1); // 获取第1位，结果为 false

long cardinality = bitSet.cardinality(); // 获取所有置1的位的数量
long length = bitSet.length(); // 获取 Bitmap 的总长度（最后一位+1）
```

---

位图用作并发锁，可以节省 redis 空间，**但由于不是天然的锁工具，无法阻塞**
```java
public boolean acquireLoginLock(Long userId) {
	RBitSet bitSet = redissonClient.getBitSet(GlobalConstant.RedisKey.FREQUENT_LOGIN_USER);
	boolean wasLocked = bitSet.set(userId, true);
	return !wasLocked;
}
```

### 💙 RScoredSortedSet
RScoredSortedSet 中的每个元素都带有分数，并且集合跟据分数进行排名（从 0 开始）
- 【增】
	- `add(double 分数, 元素)` 添加元素，并设置分数
	- `addAll(Map<元素, Double>` 批量添加
- 【删】
	- `remove(元素)` 删除指定元素
	- `removeRangeByScore(5.0, 10.0)` 删除指定分数范围的元素（包前不包后）
- 【查】
	- `readAll()` 获取所有元素
	- `valueRange(5.0, true, 10.5, true)` 获取分数范围内的元素
	- `rank(元素)` 获取指定元素的排名
	- `getScore(元素)` 获取指定元素的分数

### RLexSortedSet
RLexSortedSet 是跟据字典排序的集合

## 💛 Map
### 💙 哈希 RMap
RMap 是线程安全的，所以其操作也可以看作是原子的
- `getMap()` 
- 【改】
	- `V addAndGet(key, add的值)` 先 add 其 value，在 get，**value 只支持浮点数**
	- `V compute(Key, BiFunction函数式接口)` 函数式接口中将处理指定的 Key 的值，返回一个指定的 Key 的值的引用，~~也就是你直接修改这个引用，就会影响原来的 Map~~
		- 如果这个 key 存在，则将 Key，和该值作为函数式接口的入参；
		- 如果这个 key 不存在，则将 Key，和 null 值作为函数式接口的入参；

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

### RListMultimap

### RMapCache
`RMapCache` 可以为每个键值对单独设置 TTL，支持最大空闲时间，支持监听键过期和删除事件

# 🚶‍♂️ 分布式队列
## 💛 队列 RQueue
RQueue 是一个分布式的、线程安全的队列接口 ：
- `RQueue<?> getQueue(键)` 
	- **增**
		- `add(值)` 将值添加到队列尾部
	- **删查**
		- `poll()` 移除并返回 Queue 头部的一个元素，如果队列为空则返回 `null`
		- `peek()` 返回队列头部的元素但不移除，如果队列为空则返回 `null` 
	- 【流式调用】 stream 流，只会操作元素，不会取出元素

```java
RQueue<String> queue = redissonClient.getQueue("myQueue");
queue.add("firstElement");
String elementA = queue.peek();
String elementB = queue.poll();
```

<u>监听器</u> ：
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

## 💛 阻塞队列 RBlockingQueue
RBlockingQueue 支持阻塞操作，在队列为空，或已满的情况下，操作可以被阻塞。但不适合需要高吞吐量的场景
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

## 💛 延迟队列 RDelayedQueue

> [!quote] RDelayedQueue
> 添加到 RDelayedQueue 中的任务会在指定的延迟时间后【~~时间可以固定，也可以动态变化~~】才可被取出执行
> 
> - 通过延时处理，可以减轻某个组件的负载

---

- `RDelayedQueue getDelayedQueue(RQueue<?> A)` **从队列 A 中获取 RDelayedQueue 延迟队列对象，所以如果需要有延迟效果，你需要去 A 队列中取元素**
	- **增**
		- `offer(值，延迟时间，延迟时间单位)` 添加元素到延迟队列
	- **查**
		- `poll()` 取出延迟队列中的元素（没有延迟效果）
		- `isEmpty()` 判断延迟队列是否为空
	- 【流式操作】 stream 流，只会操作元素，不会取出元素

```java
// 元素一开始就会被加入到rDelayedQueue中，在3s后该元素会被转移到rQueue中，然后rDelayedQueue会将该元素删除

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

## 双端队列 Deque

## 阻塞双端队列 BlockingDeque


# ⚛️ 分布式原子变量
## 💛 原子长整型 AtomicLong

> [!quote] AtomicLong
> AtomicLong 是一个分布式原子 long，是一个线程安全对象
> 
> - 如果需要在多线程环境中维护一个 long 变量，可以使用
> - 需要实现高性能的计数器，可以使用
> - **想要避免加锁，来提高性能时，可以使用**
> 
> <u>原理</u> ：CAS 

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

## 整长型累加器 LongAdder
AtomicLong 底层是 CAS，而 LongAdder 是用的分段算法，能够在高高高并发下有更好地效果

> [!quote] 分段算法
> 分段算法 将**数据分为多个段，每个段独立控制**，避免了多个线程对同一数据的竞争，以提高并发性能，**最后将分段结果合并**
> 
> - 会有内存开销，但是几乎忽略
> - 在合并频繁时，会有合并开销

# 🔒 分布式锁

> [!quote] 分布式锁
> 分布式锁 可以跨 JVM 来管理共享资源的访问
> 
> - 一个节点向 redis 请求分布式锁，锁成功获取后，该节点成为锁的持有者
> - 在锁的有效期内，该节点会一直持有锁，其他节点无法获取该锁
> - 锁的有效期到了，锁会自动释放，其他节点此时可以获取到该锁

> [!NOTE] 默认不给锁设置超时时间时，其实不是一直等到手动释放锁，锁的超时时间才会改变
> 当你获取锁时，redisson 默认会为这个锁设置一个超时时间（30s），并且后台会启动一个线程”看门狗“，这个看门狗大概会在过期时间的一半左右，续期这把锁（~~续期时间可以自己设置，默认 30s~~），这样这把锁就还是没被释放

## 💛 递归锁 Lock
递归锁 就是如果一个线程已经持有锁，并再次尝试获取该锁，它可以成功获取，而不会发生死锁，**但是要保证获取了多少次锁，就要调用多少次 unlock** ：
- 【获取对象】
	- `RLock getLock(锁名)` 跟据锁名获取锁（同一锁名为同一把锁）
- `lock()` 获取锁并加锁，一直锁，直到手动释放
- `lock(10, TimeUnit.SECONDS)` 锁的有效期为 10s
- `forceUnlock()` 在非加锁线程中也可以释放锁
- `boolean tryLock(100, 10, TimeUnit.SECONDS)` 获取锁的超时时间为 100s（如果在指定时间内无法获得锁，将放弃获取锁返回 false）

```java
RLock lock = redissonClient.getLock("myLock");

lock.lock(); // 第一次加锁
// ... 执行任务

lock.lock(); // 第二次加锁，线程 A 会再次获得锁
// ... 执行任务

lock.unlock(); // 第一次解锁，计数器减 1
lock.unlock(); // 第二次解锁，计数器为 0，锁释放
```

> [!NOTE] 但是递归锁是不公平的（~~不是按照线程到达的先后顺序决定谁能获得锁~~），获得锁的规则是哪个线程的优先级高哪个线程获得锁
> 以下类型的线程优先级较高：
> - 已经运行在 cpu 上的线程（因为它不需要从挂起状态恢复，即无需上下文切换）
> - 最近使用过锁的线程

## 💛 公平锁 Fair Lock

> [!quote] 公平锁 Fair Lock
> 公平锁内部维护了一个队列，获得锁依赖于**线程请求锁的先后顺序**
> 
> - 非公平锁可能因为高优先级线程频繁插队，导致某些线程长时间得不到锁，造成线程饥饿
> - 由于需要维护队列和排队机制，**公平锁的性能通常比非公平锁低一些**

- 【获取对象】
	- `RLock getFairLock(锁名)` 跟据锁名获取锁（同一锁名为同一把锁）
- 其他方法同上 ……

## 💛 联锁 RedissonMultiLock
联锁只有在所有锁都获取到后，才会进行加锁，**如果任何一个锁获取失败，将阻塞直到所有锁都能成功获取**，当然，解锁时也会同时释放其所有锁

```java
RLock lock1 = redissonClient.getLock("lock1");
RLock lock2 = redissonClient.getLock("lock2");
RLock lock3 = redissonClient.getLock("lock3");

RedissonMultiLock lock = new RedissonMultiLock(lock1, lock2, lock3);
// 所有的锁都获取到了，才能算加锁成功
lock.lock();
...
lock.unlock();
```

## 红锁 RedLock
依次向每个 Redis 节点发送加锁命令，并记录每个节点的响应时间，如果超过锁的超时时间，则认为失败。检查成功加锁的节点数是否达到多数，如果未满足多数成功条件，立即向所有节点发送解锁请求

## 💛 读写锁 ReadWriteLock

> [!quote] 读写锁 ReadWriteLock
> <u>读写锁分为读锁，和写锁</u> ：
> - 读锁 Read Lock
>     - 允许多个线程同时获取读锁，共享访问资源
>     - 如果其他线程持有写锁，则无法获取读锁
>     - 适合读多写少的场景，提高并发性能
> - 写锁 Write Lock
>     - 只有一个线程能够获取写锁，其他线程无论是读锁还是写锁都需要等待
>     - 用于保护对资源的独占写入，确保数据的一致性

- 【获取对象】
	- `RReadWriteLock getReadWriteLock(锁名)` 
- `RLock readLock()` 获取读锁
- `RLock writeLock()` 获取写锁

## 分布式信号量 Semaphore

> [!quote] 分布式信号量 Semaphore
> Semaphore 维护了一个信号量（~~同一时刻，系统允许多少个并发线程访问某一资源~~），当一个线程想访问资源时，它需要从信号量中获取一个许可证，才能获取资源，使用完后释放许可证
> 
> - 如果没有许可可用，线程会阻塞，直到有许可释放

- 【获取对象】
	- `RSemaphore getSemaphore(锁名)` 

```java
RSemaphore semaphore = redisson.getSemaphore("printer");

// 初始化许可数量为 3
semaphore.trySetPermits(3);

// 线程 A 获取许可
semaphore.acquire();
System.out.println("Thread A is using the printer");

// 线程 B 尝试获取许可（非阻塞）
if (semaphore.tryAcquire()) {
    System.out.println("Thread B is using the printer");
} else {
    System.out.println("Thread B is waiting for the printer");
}

// 使用完后，释放许可
semaphore.release();
System.out.println("Thread A released the printer");
```

## 倒计时锁 CountDownLatch
CountDownLatch 会维护一个计数器，当计数器中的值为 0 时，才会释放锁

# 🔄 分布式异步多线程
一般不使用，因为 RFuture 里的状态太多了，序列化很麻烦，并且序列化到 redis 很占用空间

## RFuture


## RScheduledExecutorService
<u>配置</u>
```java
RExecutorService executorService = redissonClient.getExecutorService("myScheduledThreadPool");
executorService.registerWorkers(WorkerOptions
		.defaults()
		.executorService(myScheduledThreadPool.getScheduledExecutor()));
```

<u>使用</u> ：
- `submit(……)` lambda 表达式中的一切都要实现序列化接口
```java
RScheduledExecutorService executorService = redissonClient.getExecutorService("myScheduledThreadPool");
RExecutorFuture rExecutorFuture = executorService.submit(……)
```

# 🛠️ 其他分布式工具
## 💛 键 RKeys
- RedissonClient 下的方法
	- `RKeys getKeys();` 返回 RKeys 对象
	- `flushall()` 清空所有 key
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

```java
@Autowired  
private RedissonClient redissonClient;

@Test
public void testRedisson() {
	RKeys keys = redissonClient.getKeys();
	// 获取所有key值
	keys.getKeys().forEach(System.out::println);
	System.out.println("====================================");

	// 模糊获取key值
	keys.getKeysByPattern("*sys*").forEach(System.out::println);

	// 删除key
	keys.delete("sys1111", "2222_sys2222");

	// 判断key是否存在
	System.out.println(keys.countExists("awards"));

	// 获取key的数量
	System.out.println(keys.count());
}
```

## 💛 限流器 RateLimiter
- 【获取对象】
	- `RRateLimiter getRateLimiter(key)` 
- 【配置】
	- `trySetRate(RateType, 速率, 时间间隔, 时间单位)` 
		- RateType.OVERALL 全局限流，所有客户端共享同一个限流器
		- RateType.PER_CLIENT 每个客户端单独限流
- 【获取】
	- `boolean tryAcquire()` 返回 true 表示成功获取令牌
	- `tryAcquire(1, 500, TimeUnit.MILLISECONDS)` 获取 1 个令牌，等待 500 ms，如果没获取到，报超时异常

```java
RRateLimiter rateLimiter = redisson.getRateLimiter("myRateLimiter");

// 全局范围内，1s内生成5个令牌
rateLimiter.trySetRate(
	RRateLimiter.RateType.OVERALL,
	5,
	1,
	RRateLimiter.IntervalUnit.SECONDS
);

// 5. 模拟请求并尝试获取令牌
for (int i = 0; i < 10; i++) {
	boolean acquired = rateLimiter.tryAcquire();
	if (acquired) {
		System.out.println("Token acquired. Task " + i + " is processing.");
	} else {
		System.out.println("Rate limit exceeded. Task " + i + " rejected.");
	}

	// 模拟请求间隔
	try {
		Thread.sleep(200); // 每 200ms 发送一次请求
	} catch (InterruptedException e) {
		e.printStackTrace();
	}
}
```

## 💛 布隆过滤器 RBloomFilter
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

## 流 Stream
Redis Stream 用于处理日志或消息流数据，支持将消息数据持久化到磁盘，避免数据丢失
- `RStream<String, String> getStream(name)` 获取 RStream

### 生产消息
- `String add(StreamAddArgs)` 发送消息，并返回 messageId
```java
// 生产消息
RStream<String, String> logStream = redissonClient.getStream("LOG_STREAM");
StreamMessageId streamMessageId = logStream.add(StreamAddArgs.entries(Map.of(
		"level", "INFO", "message", "测试测试测试"
)));
```

### 消费消息
<u>无消费者组读取</u> ：不会标记消息是否已经被消费
- `Map<StreamMessageId, Map<K, V>> read(StreamReadArgs)` 读取的结果 Map 的键为 StreamMessageId，值为你传入的 map 数据。**消息在被读取之后不会自动删除**
- `range(StreamMessageId, StreamMessageId)` 获取指定范围的消息 

```java
// 消费消息，消费StreamMessageId在0之后的消息（不包括0）
Map<StreamMessageId, Map<String, String>> read = logStream.read(StreamReadArgs.greaterThan(new StreamMessageId(0)));
```

<u>有消费者组读取</u> ：在消费组中，当一个消费者读取消息时，消息会被标记为已消费，并且不会再被其他消费者读取
- `createGroup()` 创建消费者组
	- `StreamCreateGroupArgs` 
		- name 组名
		- makeStream 如果流不存在，则创建空流
- `readGroup()`
- `remove(streamMessageId)` 删除消息

<u>监听器</u> ：

## 发布订阅 Pub/Sub
消息是即时投递的，不会存储。如果订阅者掉线，则该订阅者将丢失在掉线期间内的所有消息

## 键空间通知
Redis Keyspace Notifications 可以用于监控键的事件（创建、删除、过期 ……）

## 管道 Pipeline
Pipeline 可以一次性提交多条更新命令，减少网络延迟

---

- Remote Service 允许在 Redis 上实现分布式服务，客户端可以像调用本地服务一样调用远程服务。通过基于 Redis 的异步和同步通信
- Spring Cache Redisson 提供了与 Spring Cache 集成的支持
- Executor Service 提供了一个分布式执行器，可以用于并行执行任务
- Scheduler Service 可以在多个 Redis 节点上定时执行任务








