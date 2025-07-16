
> [!quote] Optional\<T> 类
> Optional 类是一个<u>可以为 null 的容器对象</u>，使我们不用显式进行判空，很好的解决了空指针异常

# ❤️ 静态方法
- `of(T t)` 传递泛型 T 返回一个指定的 Optional，**如果泛型 T 为 null 会报错**
- `ofNullable(T t)` 与 `of()` 不同的是，这个泛型 T 可以为 null，那将返回一个空 Optional
- `empty()` 返回空的 Optional 对象

# ❤️ 非静态方法
<u>判断</u> ：
- `Boolean isPresent()` 判断 Optional 中是否有值
- `Boolean isEmpty()` 判断 Optional 中是否无值

<u>返回结果</u> ：
- `get()` 返回 Optional 中的对象，如果为 null ，则抛出异常
- `orElse(T t)` 如果 Optional 中有值，则返回此值；反之，返回泛型 T，~~无论 Optional 是否有值，都会计算一下泛型 T 的结果 ~~
- `or(生产接口)` 如果 Optional 为空，则计算生产接口返回备选值，只有在 Optional 为空时才计算备选值

<u>处理</u> ：
- `map(处理方法)` 将 Optional 里的对象，转为另一个类型，**不会在 Optional 为空时抛出异常**，当 Optional 未空时，将不会执行处理方法
- `filter(处理方法)` 
```java
Optional<AwardBO> optionalAwardBO = rList.stream()
		.filter(AwardBO -> Objects.equals(AwardBO.getAwardId(), awardId))
		.findFirst();
```
- `flatMap(处理方法)` 与 Stream 流同理
```java
Optional.ofNullable(item.getJSONArray("registerUserDepartmentName"))
		.ifPresent(child -> {
			child.stream().findFirst().ifPresent(node -> {
				JSONObject jsonObject = (JSONObject) node;
				if ("zh-CN".equals(jsonObject.getString("lang"))) {
					item.put("registerUserDepartmentName", jsonObject.getString("value"));
				}
			});
		});

Optional.ofNullable(item.getJSONArray("registerUserDepartmentName"))
    .map(child -> child.stream().findFirst())  // 返回 Optional<Optional<JSONObject>>
    .filter(Optional::isPresent)  // 过滤掉 Optional.empty() 的情况
    .map(Optional::get)  // 解包 Optional<JSONObject>
    .ifPresent(node -> {
        JSONObject jsonObject = (JSONObject) node;
        if ("zh-CN".equals(jsonObject.getString("lang"))) {
            item.put("registerUserDepartmentName", jsonObject.getString("value"));
        }
    });

Optional.ofNullable(item.getJSONArray("registerUserDepartmentName"))
		// 如果里面为空，都进不来flatMap方法，能进来，那child就不为空
		.flatMap(child -> child.stream().findFirst())  
		.ifPresent(node -> {
			JSONObject jsonObject = (JSONObject) node;
			if ("zh-CN".equals(jsonObject.getString("lang"))) {
				item.put("registerUserDepartmentName", jsonObject.getString("value"));
			}
		});
```
- `ifPresent(处理方法 A)` 如果该 Optional 对象的值存在，则将这个值传递给方法 A
- `ifPresentOrElse(处理方法A, 处理方法B)` 如果该 Optional 对象的值存在，则将这个值传递给方法 A，否则用方法 B 处理
```java
optional.ifPresent(rList::remove);
optional.ifPresentOrElse(
		System.out::println,
		() -> System.out.println("没有值")
);
```
- `or(处理方法A)` 当 Optional 有值时，保持原值，反之，使用 A 方法的返回值来替代
- `orElseThrow(() -> 抛异常)` 表示如果值为 null，则抛出异常
```java
first.map(Integer::parseInt)
     .orElseThrow(() -> new IllegalArgumentException("文字页数数据不规范"));
```
