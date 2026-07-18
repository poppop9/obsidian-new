```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.4.8-jre</version>
</dependency>
```

# ❤️ 集合
## RangeSet


## RangeMap
<u>理论</u> ：顾名思义 RangeMap 的 key 可以是一个范围，只要在这个范围中的值，都可以对应到相同的 value ：
- 只要实现了 Comparable 接口，可以进行比较，就可以作为 RangeMap 的范围

<u>实践</u> ：
- 构建范围
	- 双边区间
		- Range.closed 左右闭区间
		- Range.open 左右开区间
		- Range.closedOpen
		- Range.openClosed
		- Range.singleton(value) 只包含单个值的区间
	- 单边区间
		- Range.greaterThan(lower) 表示 (lower, ∞)
		- Range.atLeast(lower) 表示 \[lower, ∞)
		- Range.lessThan(upper) 表示 (-∞, upper)
		- Range.atMost(upper) 表示 (-∞, upper]
		- Range.all() 表示 (-∞, ∞)
	- 动态区间
		- Range.encloseAll(values)	根据一组值生成一个包含所有值的最小区间
```java
Range<Integer> dynamicRange = Range.encloseAll(java.util.List.of(3, 5, 7, 1));
System.out.println("Dynamic range: " + dynamicRange); // 输出: [1..7]
```

- `remove(Range<K>)` 移除指定的范围（如果要移除的范围与现有范围部分重叠，则仅移除重叠部分）
```java
RangeMap<Integer, String> rangeMap = TreeRangeMap.create();

// 添加范围映射
rangeMap.put(Range.closed(1, 10), "Low");
rangeMap.put(Range.open(10, 20), "Medium");
rangeMap.put(Range.closedOpen(20, 30), "High");

// 查询
System.out.println(rangeMap.get(5));  // 输出: Low
System.out.println(rangeMap.get(15)); // 输出: Medium
System.out.println(rangeMap.get(20)); // 输出: High
```

## MultiSet
MultiSet 中一个元素可以出现多次，用于计数元素


## MultiMap
MultiMap 允许一个键对应多个值

```java
Multimap<String, String> multimap = ArrayListMultimap.create();

// 添加键值对
multimap.put("fruit", "apple");
multimap.put("fruit", "banana");
multimap.put("fruit", "orange");
multimap.put("vegetable", "carrot");

// 获取键对应的所有值
System.out.println(multimap.get("fruit")); // 输出: [apple, banana, orange]

// 遍历所有键值对
multimap.entries().forEach(System.out::println); // (fruit=apple), (fruit=banana), 
```

## Table 二维表
Table 是一种特殊的集合，类似于一个二维的 Map，支持通过行和列进行索引


## BiMap 双向 Map
BiMap 是一种双向映射，支持键和值的快速反向查找




