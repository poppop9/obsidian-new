```xml
<dependency>
    <groupId>io.github.mouzt</groupId>
    <artifactId>bizlog-sdk</artifactId>
    <version>3.0.6</version>
</dependency>
```

# 📚 配置
- 启动类加上 `@EnableLogRecord(tenant = "com.your.company")` 
- 编写获取操作人接口
```java
/**
 * 操作人获取接口
 */
@Component
public class DefaultOperatorGetServiceImpl implements IOperatorGetService {
    @Override
    public Operator getUser() {
        String username = SecurityUtils.getUsername();
        return new Operator(username);
    }
}
```
- 编写日志持久化 Service
```java
/**
 * 日志持久化 Service
 */
@Service
public class LogRecordServiceImpl implements ILogRecordService {

    private @Resource IProcBizLogRepository bizLogRepository;

    @Override
    public void record(LogRecord logRecord) {
        String operator = logRecord.getOperator();
        ProcBizLog build = ProcBizLog.builder()
                .bizNo(logRecord.getBizNo())
                .type(logRecord.getType())
                .subType(logRecord.getSubType())
                .action(operator + " " + logRecord.getAction())
                .extra(logRecord.getExtra())
                .build();
        build.setCreateInfo();

        // 异步保存,不影响主业务
        CompletableFuture.runAsync(() -> {
            try {
                bizLogRepository.insert(build);
            } catch (Exception e) {
                log.error("保存日志失败", e);
            }
        });
    }

    @Override
    public List<LogRecord> queryLog(String bizNo, String type) {
        return List.of();
    }

    @Override
    public List<LogRecord> queryLogByBizNo(String bizNo, String type, String subType) {
        return List.of();
    }

}
```

# 📚 基本使用
## 📖 @LogRecord
- success 方法正常执行完成，无异常抛出时，记录的 action
- fail 方法执行中抛出任何异常时，记录的 action
- type 日志类型
- subType 日志子类型
- bizNo 业务编号
- extra 额外信息
- condition 条件记录日志，只有当条件为 true 时，才记录

```java
@LogRecord(success = "创建采购申请成功",
		type = "采购管理",
		subType = "创建采购申请",
		bizNo = "{{#context}}",
		extra = "{{#context}}",
		condition = "{{#result.success}}")
public void insertPurchaseApplicationWorker(NodeComponent bindCmp) {
	PurchaseApplicationContext context = bindCmp.getContextBean(PurchaseApplicationContext.class);

	// 设置日志记录上下文变量
	LogRecordContext.putVariable("context", context);
}
```

# 📚 高阶技巧
## 📖 修改操作自动对比差异
```java
@LogRecord(
	success = "修改了用户 【{{#user.username}}】 的信息",
	type = "用户管理",
	bizNo = "{{#user.id}}",
	detail = "{{#_DIFF{#oldUser, #user}}}")
```

## 📖 使用方法返回值
```java
@LogRecord(
	success = "创建订单成功,订单ID:{{#_ret.data.id}},订单号:{{#_ret.data.orderNo}}",
	type = "订单",
	bizNo = "{{#_ret.data.orderNo}}")
public Result<Order> createOrder(@RequestBody OrderCreateDTO dto) {
	Order order = orderService.create(dto);
	return Result.success(order);
}
```





