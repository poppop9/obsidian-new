[官方文档](https://www.xuxueli.com/xxl-job/index.html#%E3%80%8A%E5%88%86%E5%B8%83%E5%BC%8F%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6%E5%B9%B3%E5%8F%B0XXL-JOB%E3%80%8B)  &&  [帮助文档](https://github.com/xuxueli/xxl-job/blob/master/doc/XXL-JOB%E5%AE%98%E6%96%B9%E6%96%87%E6%A1%A3.md#%E5%88%86%E5%B8%83%E5%BC%8F%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6%E5%B9%B3%E5%8F%B0xxl-job)  &&  [github](https://github.com/xuxueli/xxl-job)

# ❤️ 基础概述
## 💛 调度中心
- 理论上默认配置下的调度中心，单机能够支撑 5000 个任务并发稳定运行

<u>任务触发线程池</u> ：
- 调度中心默认的触发任务线程是 300
- 任务触发线程池有两种 : `fastTriggerPool`（正常执行的任务） ，`slowTriggerPool` （执行偏慢的任务）。**避免执行较慢的任务占用过多资源，影响到了其他正常任务的调度**

>[!warning] 如何判断任务是慢任务 ?
>在程序中使用 `ConcurrentHashMap` 维护了一个计数器，key 为 jobId，value 为超时次数。当任务触发时间超过 500ms 时，超时次数 + 1，同一个任务在 1 分钟内超时超过了 10 次，这个任务就会被定义为慢任务，后续就会由 `slowTriggerPool` 来进行调度
>
>- 任务在第一次执行时都是由 `fastTriggerPool` 来调度的

## 💛 执行器
- XXL-JOB 调度模块默认并行，在多线程调度的情况下，调度模块被阻塞的几率很低
- XXL-JOB 调度方式
	- 不同任务 : 并行执行
	- 单个任务 : 针对多个执行器并行运行的，针对单个执行器串行执行的

<u>任务执行器线程池</u> ：
- XXL-JOB 给每一个 JobHandler 都分配了一个单独的线程来做任务处理
- 如果给任务配置了超时时间，就不会直接使用当前线程来执行方法调用，而是通过一个 futureTask 来做异步调用

# ❤️ 安装配置
## 💛 配置调度中心
- 运行官网的 [sql 文件](https://github.com/xuxueli/xxl-job/tree/master/doc/db)，创建数据库
- 创建管理中心容器，mysql 如果是容器，要连接容器内的 network
```bash
docker run -d \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://172.17.0.1:3306/xxl_job?allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="root" \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME="com.mysql.cj.jdbc.Driver" \
  -p 9384:8080 \
  --name xxl-job-admin \
  xuxueli/xxl-job-admin:2.4.2 
  
docker run -d -e PARAMS="--spring.datasource.url=jdbc:mysql://172.17.0.1:3306/xxl_job?allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai --spring.datasource.username=root --spring.datasource.password=root --spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver" -p 9384:8080 --name xxl-job-admin xuxueli/xxl-job-admin:2.4.2
```
- 默认账户 ：admin 123456

## 💛 配置执行器
- 引入依赖
```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.2</version>
</dependency>

implementation group: 'com.xuxueli', name: 'xxl-job-core', version: '2.4.2'
```
- 编写配置
```yml
xxl:
  job:
    admin:
      addresses: http://127.0.0.1:9384/xxl-job-admin  # 调度中心的地址
    # 调度中心的访问令牌，为空则不启用，default_token是调度中心默认的token
	  accessToken: default_token
    # 执行器配置
    executor:
      appName: xxl-job-executor-sample  # 该执行器的名称
      address: ""  # 该执行器的外部访问地址，如果为空，则该执行器只能被本地访问
      ip: ""  # 执行器的IP地址，为空则为本机ip
      port: 9999  # 执行器的端口，调度中心在调度任务时会访问该端口
      logPath: /data/applogs/xxl-job/jobhandler  # 执行器日志存储路径
      logRetentionDays: 30  # 执行器日志保存天数
```
- 注入 XxlJobSpringExecutor 对象
```java
@Bean
public XxlJobSpringExecutor xxlJobExecutor() {
	logger.info(">>>>>>>>>>> xxl-job config init.");
	XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
	// 以下配置均从配置文件中获取
	xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
	xxlJobSpringExecutor.setAppname(appname);
	xxlJobSpringExecutor.setAddress(address);
	xxlJobSpringExecutor.setIp(ip);
	xxlJobSpringExecutor.setPort(port);
	xxlJobSpringExecutor.setAccessToken(accessToken);
	xxlJobSpringExecutor.setLogPath(logPath);
	xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);

	return xxlJobSpringExecutor;
}
```

## 💛 对接调度中心和执行器
- **注册执行器** : 在管理页面 > 执行器管理 > 新增 > 输入执行中心配置文件的 appName，名称随意，选择自动注册 > 确定

# ❤️ 创建任务
## 💛 BEAN 模式
- 编写任务
```java
@Component
public class XxlJobTest {
    @XxlJob("testJob")
    public void execute() {
        System.out.println("xxl-job test");
        XxlJobHelper.handleSuccess();
    }
}
```
- **在调度中心创建任务** : 
	- 指定执行器
	- 指定调度周期
	- 在 JobHandler 填写 `@XxlJob` 中的名称
- 开启任务

## 💛 GLUE 模式
GLUE 模式就是直接在调度中心编写任务代码，源码存储在调度中心


# ❤️ XxlJobHelper
`XxlJobHelper` 是一个静态工具类 : 
- `handleSuccess()` / `handleFail` 设置任务执行结果
- `log()` 打印任务日志（日志不会出现在控制台）





