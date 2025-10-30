Javers 是专业级对象比对库

```xml
<dependency>
  <groupId>org.javers</groupId>
  <artifactId>javers-core</artifactId>
  <version>7.9.0</version>
</dependency>
```

# Quick Start
```java
// 构建对象
Javers javers = JaversBuilder.javers().build();

// 获取差异对象
Diff diff = javers.compare(origin, dto);

// 拿到差异数据
List<ValueChange> changes = diff.getChangesByType(ValueChange.class);
System.out.println(diff.prettyPrint());


---
ValueChange{property='amount', left='100', right='120'}
ValueChange{property='receiverName', left='张三', right='李四'}
```

- Diff 对象
	- `getChangesByType(ValueChange.class)` 获取变更字段详细信息
	- `prettyPrint()` 打印详细差异日志






