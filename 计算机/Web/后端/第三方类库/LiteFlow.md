```xml
<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.12.4.1</version>
</dependency>
```

>[!quote] LiteFlow
>> [LiteFlow](https://liteflow.cc/) 是一个业务规则编排引擎
>> ![300](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20241104005204.png)
>
> - 如果你使用 JDK11 及其以上的版本，要在 jvm 参数加上 ：
> ```bash
> --add-opens java.base/sun.reflect.annotation=ALL-UNNAMED
> ```

# ❤️ 快速开始
- 定义组件
```java
@LiteflowComponent
public class TestComponent {
    // 普通组件
    @LiteflowMethod(value = LiteFlowMethodEnum.PROCESS,
            nodeId = "a",
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


# ❤️ 组件
>[!warning] 所有在组件中定义的方法都是有类型的~~【处理方法，预处理方法，前置处理方法 ……】~~，所有的这些方法的返回值都要按照 NodeComponent 来写

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

其实选择组件，和布尔组件很类似，都可以完成对方所有的功能 #待学习 

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



# ❤️ 数据上下文
>[!hint] 所有的组件需要用到其他组件的数据时，都是利用数据上下文去取，而不是依赖于其他组件

`DefaultContext` ：是默认实现的数据上下文，你也可以自己定义
- `setData` 传入参数
- `T getData` 获取参数，~~拿到的参数类型需要自己强转~~
- `hasData` 判断是否有参数

## 💛 传入
```java
// 初始化上下文对象作为入参  
DefaultContext defaultContext = new DefaultContext();  
defaultContext.setData("key1", true);  
  
flowExecutor.execute2Resp("chain2", null, defaultContext);
```

## 💛 获取
<u>手动获取</u> ：
```java
@LiteflowMethod( …… )  
public boolean processC(NodeComponent bindCmp) {  
    System.out.println("C 组件执行了");  
    return bindCmp.getContextBean(DefaultContext.class).getData("key1");  
}
```

<u>参数注入获取</u> ：
```java

```