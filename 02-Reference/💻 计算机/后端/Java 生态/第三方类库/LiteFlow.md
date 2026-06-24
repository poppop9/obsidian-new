```xml
<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.12.4.1</version>
</dependency>

<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.15.1</version>
</dependency>
```

> [!quote] LiteFlow
> 
> > [LiteFlow](https://liteflow.cc/) 是一个业务规则编排引擎，而不是流程引擎
> > ![300](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20241104005204.png)
> 
> - 通过统一的 xml 文件编排逻辑规则，使得逻辑类之间松耦合，不用互相引用
> - LiteFlow 相当于瀑布流，没有办法暂停

> [!warning] 如果你使用 JDK11 及其以上的版本，要在 jvm 参数加上 ：
> ```bash
> --add-opens java.base/sun.reflect.annotation=ALL-UNNAMED
> ```

> [!warning] LiteFlow 是一个业务规则编排引擎，而不是流程引擎
> 流程引擎 : 流程是有角色的，比如说审批流
> 规则引擎 : 规则是一套相对复杂的逻辑块

# ❤️ 快速开始
- 定义组件
```java
@LiteflowComponent
public class TestComponent {
    // 普通组件
	@LiteflowMethod(nodeType = NodeTypeEnum.COMMON,  // 组件类型 - 普通组件  
	        value = LiteFlowMethodEnum.PROCESS,  // 组件方法类型 - 处理方法  
	        nodeId = "a",  // 组件ID  
	        nodeName = "A组件")  
    public void processA(NodeComponent bindCmp) {
        System.out.println("A组件执行了");
    }

    // SWITCH组件
    @LiteflowMethod(value = LiteFlowMethodEnum.PROCESS_SWITCH,
            nodeId = "b",
            nodeName = "B组件",
            nodeType = NodeTypeEnum.SWITCH)
    public String processB(NodeComponent bindCmp) {
        return "c";
    }

    // 布尔组件 ……
    // FOR组件 ……
    // 迭代组件 ……
}
```

- 编排组件
```yml
# 主yml文件
liteflow:  
  rule-source: application-liteflow.xml  # 规则文件路径，在resources下
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
    <chain name="chain1">
        THEN( a, b );
    </chain>
</flow>
```
- 执行业务逻辑
```java
@Resource  
private FlowExecutor flowExecutor;  
  
@Test  
void test_1() {  
    flowExecutor.execute2Resp("chain1", "test");  
}
```

# ❤️ 配置
```yml
liteflow:
  rule-source: application-liteflow-raffle.xml, application-liteflow-activity.xml
  print-execution-log: false  # 是否打印日志
```

# ❤️ 组件
> [!warning] 所有在组件中定义的方法都是有类型的~~【处理方法，预处理方法，前置处理方法 ……】~~，所有的这些方法的返回值都要按照 NodeComponent 来写

## 💛 普通组件
- `process` 该组件的业务逻辑方法
- `isAccess` 组件的预处理方法，是否进入该组件
- `isContinueOnError` 出错了是否往下继续执行，~~【默认 false】~~
- `isEnd` 
	- true 组件执行完之后，立马终止整个流程。~~属于正常结束~~
- `beforeProcess` / `beforeProcess` 是 process 处理方法的前置/后置执行器，在 isAccess 之后执行，**不推荐使用**
- `onSuccess` / `onError` 流程成功/失败的回调
- `rollback` 流程失败后的回滚方法

```java
@LiteflowMethod(nodeType = NodeTypeEnum.COMMON,  // 组件类型 - 普通组件  
        value = LiteFlowMethodEnum.BEFORE_PROCESS,  // 组件方法类型 - 前置处理
        nodeId = "a",  // 组件ID  
        nodeName = "A组件")  
public void beforeProcessA(NodeComponent bindCmp) {  
    System.out.println("A 组件的 beforeProcessA 执行了");  
}  
  
@LiteflowMethod(nodeType = NodeTypeEnum.COMMON,  // 组件类型 - 普通组件  
        value = LiteFlowMethodEnum.PROCESS,  // 组件方法类型 - 处理方法  
        nodeId = "a",  // 组件ID  
        nodeName = "A组件")  
public void processA(NodeComponent bindCmp) {  
    System.out.println("A 组件的 processA 执行了");  
}  
  
@LiteflowMethod(nodeType = NodeTypeEnum.COMMON,  // 组件类型 - 普通组件  
        value = LiteFlowMethodEnum.ON_SUCCESS,  // 组件方法类型 - 处理成功处理  
        nodeId = "a",  // 组件ID  
        nodeName = "A组件")  
public void onSuccessA(NodeComponent bindCmp) {  
    System.out.println("A 组件的 onSuccessA 执行了");  
}

---
A 组件的 beforeProcessA 执行了
A 组件的 processA 执行了
A 组件的 onSuccessA 执行了
```

## 💛 选择组件
选择组件 可以通过动态的业务逻辑判断接下去该执行哪一个节点

```java
/**
 * 活动单类型路由器
 */
@LiteflowMethod(nodeType = NodeTypeEnum.SWITCH,
		value = LiteFlowMethodEnum.PROCESS_SWITCH,
		nodeId = "ActivityOrderTypeRouter",
		nodeName = "活动单类型路由器")
public String ActivityOrderTypeRouter(NodeComponent bindCmp) {
	return "nodeId";
}
```

```xml
<chain name="chain1">
    SWITCH(a).to(b, c);
</chain>
```

## 💛 布尔组件
```java
@LiteflowMethod(nodeType = NodeTypeEnum.BOOLEAN,  // 组件类型 - 布尔组件
		value = LiteFlowMethodEnum.PROCESS_BOOLEAN,  // 组件方法类型 - boolean处理方法
		nodeId = "c",
		nodeName = "C组件")
public boolean processC(NodeComponent bindCmp) {
	System.out.println("C 组件执行了");
	return true;
}
```

```xml
<chain name="RaffleFilterChain">  
	IF(CheckProceed, NormalTimeMatchRafflePoolFilter)
</chain>
```

## NodeComponent
```java
public void processA(NodeComponent bindCmp) { …… }
```

- 【改】
	- `setIsEnd(boolean)` 是否立即结束整个流程
- 【查】
	- `getContextBean(clazz)` 获取当前你自己定义的上下文，从而可以获取任何数据
	- `getNodeId` 获取组件 ID
	- `getName` 获取组件名
	- `getChainName` 获取当前执行的流程名
	- `getRequestData` 获取流程的初始参数
	- `getTag` 获取组件的标签信息
	- `invoke` / `invoke2Response` 隐式调用，~~在该组件中调用另一个组件~~

# ❤️ 编排
```yml
# 主yml文件
liteflow:  
  rule-source: application-liteflow.xml  # 规则文件路径
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
    <chain name="chain1">
        THEN( a, b );
    </chain>
</flow>
```

# ❤️ 流程入参
流程入参能做的数据上下文都能实现

# ❤️ 数据上下文
> [!hint] 所有的组件需要用到其他组件的数据时，都是利用数据上下文去取，而不是依赖于其他组件

`DefaultContext` ：是默认实现的数据上下文，你也可以自己定义
- `setData` 传入参数
- `T getData` 获取参数，~~拿到的参数类型需要自己强转~~
- `hasData` 判断是否有参数

---

<u>自定义数据上下文</u>  ：自定义数据上下文不需要继承什么，就直接定义一个类就好了，然后可以在组件中取出：
```java
@Data
public class RaffleFilterContext{ …… }
```

```java
RaffleFilterContext context = bindCmp.getContextBean(RaffleFilterContext.class);
```

<u>传入</u> ：
```java
// 初始化上下文对象作为入参  
DefaultContext defaultContext = new DefaultContext();  
defaultContext.setData("key1", true);  
  
flowExecutor.execute2Resp("chain2", null, defaultContext);
```

<u>获取</u> ：
- 手动获取
```java
@LiteflowMethod( …… )  
public boolean processC(NodeComponent bindCmp) {  
    System.out.println("C 组件执行了");  
    
    // 如果在这里修改了DefaultContext，下一个组件获取时，就会拿到修改后的值，修改的是上下文的引用
    return bindCmp.getContextBean(DefaultContext.class).getData("key1");  
}
```

# ❤️ 执行器
执行器 是一个流程的触发点，你可以在代码的任意地方用执行器进行执行流程

```java
@Resource  
private FlowExecutor flowExecutor;  
```

## 💛 阻塞执行
- `LiteflowResponse execute2Resp(String chainId, Object param, Class<?>... contextBeanClazzArray)` 第一个参数为流程 ID，第二个参数为流程入参，后面可以传入多个上下文 class
- `LiteflowResponse execute2Resp(String chainId, Object param, Object... contextBeanArray)` 第一个参数为流程 ID，第二个参数为流程入参，后面可以传入多个上下文的 Bean

> [!quote] LiteflowResponse
> LiteflowResponse 是执行器的执行结果
> - `getContextBean(上下文class对象)` 获取上下文
> - `isSuccess()` 流程执行是否成功
> - `Exception getCause()` 获取异常信息

## 💛 非阻塞执行
- `Future<LiteflowResponse> execute2Future(String chainId, Object param, Object... contextBeanArray)` 

<u>默认配置</u> ：
```yml
liteflow:
  # 主线程池中的工作线程数
  main-executor-works: 64
  # 配置线程池实现类
  main-executor-class: com.yomahub.liteflow.thread.LiteFlowDefaultMainExecutorBuilder
```

<u>自定义线程池实现类</u> ：
```java
public class CustomThreadBuilder implements ExecutorBuilder {
    @Override
    public ExecutorService buildExecutor() {
        return Executors.newCachedThreadPool();
    }
}
```

# ❤️ 决策路由
决策路由会并行执行你指定的多条 chain，若 route 为 false，则终止执行

- `List<LiteflowResponse> executeRouteChain(流程入参, 数据上下文)` 会执行所有带有 `<route>` 标签的 chain
- `List<LiteflowResponse> executeRouteChain(命名空间, 流程入参, 数据上下文)` 会执行指定命名空间下的所有带 `<route>` 标签的 chain

```java
<chain name="chain1" namespace="n1">
    <route>
        AND(r1, r2, r3)
    </route>
    <body>
        THEN(a, b, c);
    </body>
</chain>

<chain name="chain2" namespace="n1">
    <route>
        AND(OR(r4, r5), NOT(r3))
    </route>
    <body>
        SWITCH(x).TO(d, e, f);
    </body>
</chain>

<chain name="chain3" namespace="n2">
    <route>
        r4
    </route>
    <body>
        WHEN(a,b);
    </body>
</chain>
```

```java
// 执行 n1 空间下的带 route 的 chain
flowExecutor.executeRouteChain("n1", null, YourContext);
```

# ❤️ LiteFlowX 插件


# ❤️ 高级特性
## 💛 重试机制
```xml

<chain id="chain1">
	THEN(a, b.retry(3)),
    THEN(a, b).retry(3, "java.lang.NullPointerException", "app.xlog.ggbond.raffle.service.filterChain.filters.RetryRouterException");
</chain>
```

## 💛 前后置组件
前后置组件不受 exception 的影响

```java
<chain name="chain1">
    THEN(
        PRE(p1, p2), 
        a, b, c, 
        FINALLY(f1, f2)
    );
</chain>
```