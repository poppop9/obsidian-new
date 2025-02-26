```xml
<dependency>
	<groupId>io.github.dvgaba</groupId>
	<artifactId>easy-random-core</artifactId>
	<version>7.1.0</version>
</dependency>
```

easy-random 是一个方便生成随机对象的库

# ❤️ Quick Start
```java
User user = new EasyRandom().nextObject(User.class)
```

# ❤️ 设定随机值的规则
- `seed(long)` 随机种子（传入相同的值，无论运行多少次，生成的随机值都完全相同），**预定义值为 123**
- `stringLengthRange` 设置随机字符串长度范围
- `dateRange` 设置日期范围
- `timeRange` 
- `collectionSizeRange` 定义随机生成的集合的大小范围
- `randomize` 自定义某种类型的生成规则

```java
EasyRandomParameters parameters = new EasyRandomParameters()  
        .randomize(Long.class, () -> {  
            long min = 1000; // 指定范围的最小值  
            long max = 10000; // 指定范围的最大值  
            return min + (long) (Math.random() * (max - min + 1)); // 生成范围内的随机值  
        });
        
EasyRandomParameters parameters = new EasyRandomParameters()
		.seed(123L)
		.stringLengthRange(5, 10)
		.dateRange(LocalDate.of(2000, 1, 1), LocalDate.of(2025, 12, 31))
		.randomize(BigDecimal.class, () -> new BigDecimal("123.45"));

MyClass randomObject = new EasyRandom(parameters).nextObject(MyClass.class);
```