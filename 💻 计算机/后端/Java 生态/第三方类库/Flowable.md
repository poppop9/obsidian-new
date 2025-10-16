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

```java
ProcessInstance processInstance = runtimeService.createProcessInstanceQuery()
    .processInstanceBusinessKey(applicationId)
    .singleResult();
```

## TaskService
任务服务（审批、签收、查询待办任务）

🏷️ 查询
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


