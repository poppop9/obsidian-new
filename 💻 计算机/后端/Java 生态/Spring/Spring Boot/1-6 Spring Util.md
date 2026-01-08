# 📚 常用对象
## 📖 Pair
🔴 使用场景 ：有时方法需要返回两个相互关联的数据，但不想定义一个新类

```java
// 构建 Pair
public Pair<User, Order> loadUserAndOrder(Long id) {
    User user = userService.findById(id);
    Order order = orderService.findByUserId(id);
    return Pair.of(user, order);
}

// 使用 Pair
Pair<User, Order> pair = loadUserAndOrder(1L);
User user = pair.getFirst();
Order order = pair.getSecond();
```

## 📖 Triple
🔴 使用场景 ：有时方法需要返回三个相互关联的数据，但不想定义一个新类

```java
Triple<String, Integer, Boolean> triple = Triple.of("Tom", 20, true);

triple.getFirst();
triple.getSecond();
triple.getThird();
```