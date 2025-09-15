$$
如果失败是确定性的，那么重试就是浪费时间
$$

```xml
<!-- 引入此框架前，需要引入AOP -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

[官方文档](https://github.com/spring-projects/spring-retry/blob/main/README.md#stateful-retry)

# ❤️ 准备
- 在任何 `@Configuration` 上加 `@EnableRetry` 
```java
@EnableRetry
@SpringBootApplication
public class SpringAopApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringAopApplication.class, args);
    }
}
```

我们会有两种方式来实现 Spring Retry：1. 注解 ，2. RetryTemplate

# ❤️ 注解方式 - @Retryable
```java
@Service
public class RetryService {

    @Retryable
    public void retry(String s) {
        String ss = null;

        System.out.println("retry ……");
        System.out.println(ss.length() + s.length());
    }

    @Recover
    public void recover(Exception e) {
        System.out.println("啦啦啦 ……");
    }
}

---
retry ……
retry ……
retry ……
啦啦啦 ……
```

## 重试机制

> [!quote] `@Retryable`
> 你可以定义当方法出现何种异常时，如何重试 ：
> - `retryFor` 指明需要重试的异常
> - `noRetryFor` 排除不需要重试的异常
> - `recover` 指定恢复方法
> - `exceptionExpression` 进行更加细粒度的控制，指明是否要重试
> - `notRecoverable` 指明哪些异常不需要恢复方法
> 
> <u>特点</u> :
> - 不指定异常，即为重试所有异常
> - 默认重试三次，每次间隔 1s
> - 一旦达到最大尝试次数，但仍有异常，就会抛出 `ExhaustedRetryException`

- `@Backoff` 重试时间间隔
	- delay 固定间隔
	- maxDelay 限制最大的间隔时间
	- multiplier 递增倍数
	- random 随机范围间隔

```java
@Service
public interface MyService { 
    @Retryable(retryFor = {NullPointerException.class},  // 重试的异常
            maxAttempts = 3,  // 最大重试次数
            recover = "recover",  // 指定恢复方法
            backoff = @Backoff(delay = 2000, multiplier = 1.5))  // 重试间隔(间隔为2s，以1.5倍递增)
    void retryService(String sql); 
}
```

## 恢复机制

> [!quote] `@Recover`
> 你可以定义当方法重试后依旧失败时，要执行的方法 ：
> - 恢复方法的第一个参数是异常类，后续参数按照重试方法的参数来写
> - 恢复方法的返回值，要和重试方法的返回值保持一致
> - 由于被 @Recover 注释的方法处理了异常，所以最后并不会抛出异常

```java
@Service
public interface MyService { 

    @Retryable(retryFor = SQLException.class)
    void retryServiceWithRecovery(String sql) throws SQLException; 

    @Recover
    void recover(SQLException e, String sql); 
}
```

> [!hint] 如果 recover 方法中，需要到重试方法的某些信息，我们可以自定义 Exception，然后把这些信息 set 进去，之后在 recover 方法中捕获时 get
> ```java
> @Recover
> public Boolean recordErrorLog(RetryException retryException, DepartmentPO departmentPO) throws Exception {
> 	String type = retryException.getType();
> 	BaseResponse resp = retryException.getResp();
> }
> ```

## 上下文信息 RetryContext
```java
@Retryable(listeners = {"defRetryListener"})
public void retry(String key) throws Exception {
	RetryContext context = RetrySynchronizationManager.getContext();
	System.out.println(context.getRetryCount() + "retry ……" + key);
	
	throw new Exception("retry");
}
```

## 监听器
- 直接少写一个类，直接匿名内部类来实现接口并返回 Bean
```java
@Bean
public RetryListener createRetryListener() {
	return new RetryListener() {
		/**
		 * 重试前
		 *
		 * @return 是否允许重试方法的执行
		 */
		@Override
		public <T, E extends Throwable> boolean open(RetryContext context, RetryCallback<T, E> callback) {
			System.out.println("重试前 ……");
			return RetryListener.super.open(context, callback);
		}
		
		/**
		 * 重试后
		 */
		@Override
		public <T, E extends Throwable> void close(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {
			System.out.println("重试后 ……");
			RetryListener.super.close(context, callback, throwable);
		}

		/**
		 * 重试成功
		 */
		@Override
		public <T, E extends Throwable> void onSuccess(RetryContext context, RetryCallback<T, E> callback, T result) {
			System.out.println("重试成功 ……");
			RetryListener.super.onSuccess(context, callback, result);
		}

		/**
		 * 重试失败
		 */
		@Override
		public <T, E extends Throwable> void onError(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {
			System.out.println("重试失败 ……");
			RetryListener.super.onError(context, callback, throwable);
		}
	};
}
```

- 注册监听器
```java
@Retryable(listeners = {"defRetryListener"})
```


## 熔断器

> [!quote] `@CircuitBreaker` 

```java
@Service
class ShakyBusinessService {
	@CircuitBreaker(include = BoomException.class, openTimeout = 20000L, resetTimeout = 5000L, maxAttempts = 1)
	public int desireNumber() throws Exception {
		System.out.println("calling desireNumber()");
		if (Math.random() > .5) {
			throw new BoomException("Boom");
		}
		return 1;
	}
	
	@Recover
	public int fallback(BoomException ex) {
		return 2;
	}
}
```

# ❤️ 工具类方式 - RetryTemplate

> [!warning] 什么时候要使用 RetryTemplate 替代注解，来实现重试机制呢 ?
> - 不使用 IOC 容器时
> - 场景复杂时
> - 在重试时，并且抛出的异常不是自定义时，但是需要保存某些信息时
> - 使用监听器 Listener 时
> - 需要统计分析

---

- 配置 RetryTemplate
	- 重试次数
	- 重试间隔
	- 异常
```java
@Configuration
public class RetryConfig {
    @Bean
    public RetryTemplate createRetryTemplate() {
        return RetryTemplate.builder()
                .maxAttempts(3)  // 最大重试次数
//                .infiniteRetry()  // 无限重试
                .fixedBackoff(1000L)  // 固定重试间隔
//                .exponentialBackoff(100, 2, 10000)  // 重试间隔策略：指数退避
//                .uniformRandomBackoff(1000, 3000)  // 重试延迟在1-3秒之间随机
                .retryOn(IOException.class)  // 当什么异常发生时，重试
                .traversingCauses()  // 判断根异常，而不是直接异常。不指定时，如果抛出异常是该异常的的父异常，并且这个父异常是由该异常引起的，则不会重试
                .build();
    }
}
```

- 测试
	- `RetryContext` 
		- getRetryCount
		- getParent
		- getLastThrowable
		- setAttribute 自定义属性
	- `DefaultRetryState(key, 是否强制清缓存，接收一个异常处理后给出是否要回滚)` ~~一般是判断如果是数据库异常就回滚~~ 

```java
@Resource
private RetryTemplate retryTemplate;

public void retryWithTemplate() throws Exception {
	// 设置缓存
	retryTemplate.setRetryContextCache(new MapRetryContextCache());

	Object result = retryTemplate.execute(
			// 重试方法
			context -> {
				System.out.println("save数据 ……");
				System.out.println(
						context.getRetryCount() + " "  // 重试次数
						+ context.getParent() + " "  // 上层环境
						+ context.getLastThrowable()  // 上次异常
				);

				// 自定义属性
				context.setAttribute("temp", "valuevalue");

				String s = null;
				System.out.println(s.length());

				return new Object();  // 返回重试方法执行结果
			},
			// 恢复方法
			context -> {
				System.out.println("===============================");
				System.out.println("recover ……");
				System.out.println(context.getAttribute("temp"));

				return new Object();  // 要与重试方法返回值类型一致
			},
			// 重试状态
			new DefaultRetryState(IdUtil.randomUUID(), true, exception -> false)
	);
}

---
save数据 ……
0 null null
save数据 ……
1 null java.lang.NullPointerException: Cannot invoke "String.length()" because "s" is null
save数据 ……
2 null java.lang.NullPointerException: Cannot invoke "String.length()" because "s" is null
===============================
recover ……
valuevalue
```

## 监听器 RetryListener
- **重试开始前**：可以记录日志，或执行初始化操作
- **重试失败时**：可以捕获并处理异常，记录重试次数
- **重试成功后**：可以记录成功信息

---

<u>实现 RetryListener</u> ：
```java
public class DefRetryListener implements RetryListener {  
    /**  
     * 重试前  
     * @return 是否允许重试方法的执行  
     */  
    @Override  
    public <T, E extends Throwable> boolean open(RetryContext context, RetryCallback<T, E> callback) {  
        System.out.println("重试前 ……");  
        return RetryListener.super.open(context, callback);  
    }  
  
    /**  
     * 重试后  
     */  
    @Override  
    public <T, E extends Throwable> void close(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {  
        System.out.println("重试后 ……");  
        RetryListener.super.close(context, callback, throwable);  
    }  
  
    /**  
     * 重试成功  
     */  
    @Override  
    public <T, E extends Throwable> void onSuccess(RetryContext context, RetryCallback<T, E> callback, T result) {  
        System.out.println("重试成功 ……");  
        RetryListener.super.onSuccess(context, callback, result);  
    }  
  
    /**  
     * 重试失败  
     */  
    @Override  
    public <T, E extends Throwable> void onError(RetryContext context, RetryCallback<T, E> callback, Throwable throwable) {  
        System.out.println("重试失败 ……");  
        RetryListener.super.onError(context, callback, throwable);  
    }  
}
```

<u>注册监听器</u> ：
```java
@Bean
public RetryTemplate createRetryTemplate() {
	return RetryTemplate.builder()
			.maxAttempts(3)  // 最大重试次数
			.fixedBackoff(1000L)  // 固定重试间隔
			.retryOn(Exception.class)
			.traversingCauses()  // 判断根异常，而不是直接异常
			.withListener(new DefRetryListener())  // 注册监听器
			.build();
}
```

# ❤️ 注意
- Retry 基于 AOP ，所以一切 AOP 的问题，也就是 Retry 的问题，比如 ：~~AOP 无法拦截内部调用~~
```java
public class Demo {
    public void A() {
        B();  // 直接调用B方法，不会触发重试机制
    }

    @Retryable(Exception.class)
    public void B() {
        throw new RuntimeException("retry...");
    }
}
```

---

- Spring Retry 可以结合熔断器







