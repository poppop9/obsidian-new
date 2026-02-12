<u>静态方法</u> ：
- `naturalOrder()` 返回一个自然排序的比较器，数字按从小到大，字符串按字母从 A 到 Z
- `reverseOrder()` 反自然排序比较器
- `comparingInt(……)` 返回一个数字比较器，对数字进行升序排列，传入的参数可以不实现 Comparable 接口
```java
.stream()
.sorted(Comparator.comparingInt(o -> o.get("awardSort").asInt()))
```

---

<u>泛型问题</u> ：为什么以下代码不能写成 `Comparator<JSONObject>.comparingLong` ，这是因为 `Comparator<JSONObject>` 表示一个 JSONObject 类型的比较器实例，而 comparingLong 是 Comparator 类的静态方法，不能通过实例来访问静态方法。
因此，正确的写法是通过类名 Comparator 调用静态方法，并显式指定泛型参数
```java
List<JSONObject> list = abstractStandingBookData.stream()
        .map(AbstractStandingBookData::getContent)
        .sorted(Comparator.<JSONObject>comparingLong(item -> item.getLong("orderIndex")).reversed())
        .toList();
```


