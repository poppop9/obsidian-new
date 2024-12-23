
# Quick Start
- 事件
```java
@Data
public class GenericEvent extends ApplicationEvent {
    private Long userId;

    public GenericEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
}
```
- 监听器
```java
@Component 
public class EventListenerService {
	@EventListener
	public void handleGenericEvent(GenericEvent event) {
		// 对这个事件的处理逻辑 ……
	}
}
```
- 事件中心
```java
@Autowired
private ApplicationEventPublisher publisher;

public void publishUserRegisteredEvent(String userId) {
    publisher.publishEvent(new GenericEvent(this, userId));
}
```

# 基本概念
Spring Event 中事件的执行默认是同步的，~~也就是事件的发布者在监听器执行的过程中是阻塞的~~，如果需要异步，可以使用 `@Async`


# 设计
## 完全解耦
如果 A 发布事件，B 声明监听器，那这个监听器就要指定监听的事件类，这个事件类是定义在 A 中的。**那就没有达到解耦的效果**，我们可以使用通用事件类，并指定事件类型属性

```java
// 通用事件类
public class EventMessage {
    private String eventType;
    private Object payload;
    ……
}

// 发布事件
public class A {
    private ApplicationEventPublisher publisher;

    public void publishEvent() {
        EventMessage message = new EventMessage("A_EVENT", payload);
        publisher.publishEvent(message);
    }
}

// 监听器
public class BListener {
    @EventListener
    public void handleEvent(EventMessage message) {
        // 判断类型再处理
        if ("A_EVENT".equals(message.getEventType())) {
            // 处理 A 事件
        }
    }
}
```





