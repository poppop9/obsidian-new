
```xml
<dependency>
    <groupId>com.alibaba.cola</groupId>
    <artifactId>cola-component-statemachine</artifactId>
    <version>5.0.0</version>
</dependency>

implementation group: 'com.alibaba.cola', name: 'cola-component-statemachine', version: '5.0.0'
```

由于 Spring StateMachine 实例不是无状态的，无法做到线程安全，所以代码要么需要使用锁同步，要么需要用 Threadlocal

COLA 给我们提供了一个无状态的，轻量化的状态机，接入十分简单

>[!quote] 状态机
> 状态机 能明确地定义状态、事件、转移条件以及状态之间的转移过程，可以有效地管理和控制系统的复杂性
> 
> - **状态 State** ：系统在某一时刻的具体条件或情形（~~“待支付”、“已支付”、“待发货”、“已发货”~~）
> - **事件 Event** ：触发状态转移的动作（~~例如支付完成、支付失败~~）
> - **转移 Transition** ：从一个状态转移到另一个状态的过程
> - **外部流转 External Transition** ：外部流转，两个不同状态之间的流转
> - **内部流转 Internal Transition** ：同一个状态之间的流转（特定事件的发生不会改变状态，但是会触发一些动作）
> - **初始状态 Initial State** ：系统启动时的初始状态（~~比如订单初始状态可能是“待支付”~~）
> - **结束状态 Final State** ：系统不再进行状态转移时的状态（~~比如订单的结束状态可能是“已完成”或“已取消”~~）
> - **条件 Condition** ：表示是否允许到达某个状态
> - **动作 Action** ：到达某个状态之后，可以做什么


---

https://fxzcloud.tech/article/components/cola-statemachine.html
https://openatomworkshop.csdn.net/664ee1f3b12a9d168eb70666.html
https://cloud.benym.cn/pages/2ae430/#%E8%83%8C%E6%99%AF
https://cloud.tencent.com/developer/article/2350454