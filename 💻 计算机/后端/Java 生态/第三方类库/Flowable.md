```xml
// 兼容 java 8
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>6.8.1</version>
</dependency>

// 兼容 java 17
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>7.2.0</version>
</dependency>
```

## 方案一：通过业务关联查询
如果你在启动流程时使用了 `businessKey` 关联申请单 ID：

```java
// 启动流程时
ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
    "processDefinitionKey", 
    businessKey,  // 申请单ID
    variables
);

// 查询当前任务
Task currentTask = taskService.createTaskQuery()
    .processInstanceBusinessKey(businessKey)  // 通过业务key查询
    .active()  // 只查询活动的任务
    .singleResult();  // 获取单个结果
```

# 常用类
## RepositoryService
仓库服务（管理所有流程图文件（.bpmn）的部署与版本）



## RuntimeService
运行时服务（负责启动、查询、控制流程实例的运行）

- `Object getVariable(实例id, variableName)` 拿到某个实例指定的上下文
- `setVariable(实例id, key, value)` 直接更新流程变量
- 查询流程实例（只能查询正在运行中的流程实例）
```java
ProcessInstance processInstance = runtimeService.createProcessInstanceQuery()
    .processInstanceBusinessKey(applicationId)
    .singleResult();
```

## TaskService
任务服务（审批、签收、查询待办任务）

🏷️ 查询（只能查询正在进行中的 task）
- 查询条件
- 查询结果
	- `list()` 
	- `singleResult()` 

```java
taskService.createTaskQuery()
    .processInstanceBusinessKey(businessKey)
    .active()  // 活动的任务
    .taskAssignee(userId)  // 指定办理人
    .taskCandidateUser(userId)  // 候选人
    .orderByTaskCreateTime().desc()  // 按创建时间排序
    .singleResult();
```

# 其他
## 监听器
监听器和 Flowable 流程推进默认是在同一个线程同一个事务中，是强关联的（如果监听器中抛出异常，Flowable 的流程推进会回滚，整个操作失败）

🏷️ 事件类型
- create 任务创建
- assignment 任务被指派
- complete 任务完成

## JavaDelegate
如果 JavaDelegate 抛出异常：
- 当前事务会回滚
- 节点不会被标记完成
- 流程不会推进到下一个节点

# 动态创建流程
## Call Activity
- 当 Call Activity 的所有实例都走完后，后续就不能再动态创建实例了


## 事件子流程


# 例子
- 一旦 overallInvoiceStatus == 'FULLY_INVOICED' 并且父流程通过条件事件结束了发票容器：
	- 已经存在的事件子流程可以继续完成，不会中断
	- 新的发票事件子流程无法再创建
```xml
<!-- ==================== 分支1：发票处理容器（包含事件子流程） ==================== -->
<subProcess id="invoiceProcessContainer" name="发票处理流程容器">

	<!-- 容器内主流程：等待发票完成 -->
	<startEvent id="invoiceContainerStart" name="发票流程开始"/>

	<!-- 等待发票全部完成的中间事件 -->
	<intermediateCatchEvent id="waitInvoiceComplete" name="等待发票完成">
		<conditionalEventDefinition>
			<condition xsi:type="tFormalExpression">
				${overallInvoiceStatus == 'FULLY_INVOICED'}
			</condition>
		</conditionalEventDefinition>
	</intermediateCatchEvent>

	<sequenceFlow id="invoiceContainerFlow1" sourceRef="invoiceContainerStart" targetRef="waitInvoiceComplete"/>

	<endEvent id="invoiceContainerEnd" name="发票流程结束"/>
	<sequenceFlow id="invoiceContainerFlow2" sourceRef="waitInvoiceComplete" targetRef="invoiceContainerEnd"/>

	<!-- ==================== 事件子流程：动态处理每个发票 ==================== -->
	<subProcess id="invoiceEventSubProcess" name="发票处理事件子流程" triggeredByEvent="true">

		<!-- 消息启动事件（非中断） -->
		<startEvent id="invoiceMessageStart" name="收到上传发票请求" isInterrupting="false">
			<messageEventDefinition messageRef="uploadInvoiceMessage"/>
		</startEvent>

		<!-- 上传发票任务 -->
		<userTask id="uploadInvoice" name="上传发票" flowable:assignee="${invoiceUser}">
			<extensionElements>
				<flowable:taskListener event="create" class="com.example.listener.InvoiceUploadListener"/>
			</extensionElements>
		</userTask>
		<sequenceFlow id="eventInvFlow1" sourceRef="invoiceMessageStart" targetRef="uploadInvoice"/>

		<!-- 确认发票任务 -->
		<userTask id="confirmInvoice" name="确认发票" flowable:assignee="${invoiceManager}">
			<extensionElements>
				<flowable:taskListener event="complete" class="com.example.listener.InvoiceConfirmListener"/>
			</extensionElements>
		</userTask>
		<sequenceFlow id="eventInvFlow2" sourceRef="uploadInvoice" targetRef="confirmInvoice"/>

		<!-- 结束事件 -->
		<endEvent id="invoiceEventEnd" name="单个发票处理完成"/>
		<sequenceFlow id="eventInvFlow3" sourceRef="confirmInvoice" targetRef="invoiceEventEnd"/>

	</subProcess>

</subProcess>
```