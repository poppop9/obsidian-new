
```xml
<dependency>
    <groupId>com.alibaba.cola</groupId>
    <artifactId>cola-component-statemachine</artifactId>
    <version>5.0.0</version>
</dependency>

implementation group: 'com.alibaba.cola', name: 'cola-component-statemachine', version: '5.0.0'
```

---

<u>技术选型</u> ：
- Spring StateMachine
	- 实例不是无状态的，无法做到线程安全
- COLA
	- 无状态的，轻量化的

> [!quote] 状态机
> 状态机 能明确地定义状态、事件、转移条件以及状态之间的转移过程，可以有效地管理和控制系统的复杂性
> 
> - **状态 State** ：系统在某一时刻的具体条件或情形（~~“待支付”、“已支付”、“待发货”、“已发货”~~）
> - **事件 Event** ：触发状态转移的动作（~~例如支付完成、支付失败~~）
> - **流转 Transition** ：从一个状态转移到另一个状态的过程
> - **外部流转 External Transition** ：外部流转，两个不同状态之间的流转
> - **内部流转 Internal Transition** ：同一个状态之间的流转（特定事件的发生不会改变状态，但是会触发一些动作）
> - **初始状态 Initial State** ：系统启动时的初始状态（~~比如订单初始状态可能是“待支付”~~）
> - **结束状态 Final State** ：系统不再进行状态转移时的状态（~~比如订单的结束状态可能是“已完成”或“已取消”~~）
> - **条件 Condition** ：表示是否允许到达某个状态
> - **动作 Action** ：到达某个状态之后，可以做什么

![450](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20250103172332.png)

# 配置准备
## 状态
```java
/**
 * 订单状态
 */
@Getter
@AllArgsConstructor
public enum OrderStatus {
    INITIAL(202, "初始状态"),
    PAY_PENDING(102, "订单待支付"),
    PAY_SUCCESS(200, "订单已支付"),
    PAY_FAILED(402, "订单支付失败"),
    PAY_TIMEOUT(402, "订单支付超时"),
    CANCELED(410, "订单已取消");

    private final int code;
    private final String info;
}
```

## 事件
```java
/**
 * 订单事件
 */
@Getter
@AllArgsConstructor
public enum OrderEvents {
    CreateOrder(201, "创建订单"),
    PAYING(102, "支付确认"),
    PAY_SUCCESS(200, "支付成功"),
    PAY_FAIL(402, "支付失败");

    private final int code;
    private final String info;
}
```


## 上下文
```java
/**
 * 订单上下文
 */
@Data
@Accessors(chain = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderContext {
    private Long orderId;  // 订单id
    private Long payAmount;  // 支付金额
}
```

## 状态机配置
- 当 when 条件为 false 时，不会报错，只是不执行 perform 块而且

```java
@Slf4j
@Configuration
public class StateMachineConfig {

    @Bean
    public StateMachine<OrderStatus, OrderEvents, OrderContext> stateMachine() {
        StateMachineBuilder<OrderStatus, OrderEvents, OrderContext> builder = StateMachineBuilderFactory.create();

        // 外部 - 创建订单：初始状态 -> 待支付状态
        builder.externalTransition().from(OrderStatus.INITIAL).to(OrderStatus.PAY_PENDING)
                .on(OrderEvents.CreateOrder)  // 触发事件
                .when(context -> context.getPayAmount() > 0)  // 流转条件
                .perform((S1, S2, E, C) -> log.info("订单创建成功，订单id：{}", C.getOrderId()));  // 动作

        // 外部 - 支付失败：订单已取消、支付超时状态 -> 支付失败状态
        builder.externalTransitions().fromAmong(OrderStatus.CANCELED, OrderStatus.PAY_TIMEOUT).to(OrderStatus.PAY_FAILED)
                .on(OrderEvents.PAY_FAIL)
                .when(context -> context.getPayAmount() > 0)
                .perform((S1, S2, E, C) -> log.info("订单支付失败，订单id：{}", C.getOrderId()));

        // 内部 - 支付失败：支付失败状态 -> 支付失败状态
        builder.internalTransition().within(OrderStatus.PAY_FAILED)
                .on(OrderEvents.PAY_FAIL)
                .when(context -> true)
                .perform((S1, S2, E, C) -> log.info("支付失败，订单id：{}", C.getOrderId()));

        // 创建状态机
        return builder.build(GlobalConstant.ORDER_MACHINE_ID);
    }

}
```

# 事件中心
- 状态机发布事件，默认是阻塞的
```java
/**
 * 状态机事件中心
 */
@Component
public class OrderStateMachineEventCenter {
    /**
     * 发布创建订单事件
     */
    public void publishCreateOrderEvent() {
        OrderStatus orderStatus = StateMachineFactory.<OrderStatus, OrderEvents, OrderContext>get(GlobalConstant.ORDER_MACHINE_ID)
                .fireEvent(
                        OrderStatus.INITIAL,
                        OrderEvents.CreateOrder,
                        new OrderContext().setOrderId(12345L).setPayAmount(100L)
                );
    }
}
```

---

[原理](https://fxzcloud.tech/article/components/cola-statemachine.html)









