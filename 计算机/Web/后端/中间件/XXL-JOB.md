
# 安装配置
<u>管理中心</u> ：
- 运行官网的 [sql 文件](https://github.com/xuxueli/xxl-job/tree/master/doc/db)，创建数据库
- 创建管理中心容器，mysql 如果是容器，要连接容器内的 network
```bash
docker run -d \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://172.17.0.1:3306/xxl_job?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai" \
  -e SPRING_DATASOURCE_USERNAME="root" \
  -e SPRING_DATASOURCE_PASSWORD="root" \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME="com.mysql.cj.jdbc.Driver" \
  -p 9384:8080 \
  --name xxl-job-admin \
  xuxueli/xxl-job-admin:2.4.2 
  
docker run -d -e PARAMS="--spring.datasource.url=jdbc:mysql://172.17.0.1:3306/xxl_job?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai --spring.datasource.username=root --spring.datasource.password=root --spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver" -p 9384:8080 --name xxl-job-admin xuxueli/xxl-job-admin:2.4.2
```
- 默认账户 ：admin 123456

<u>执行中心</u> ：
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
      # 调度中心的地址
      addresses: http://127.0.0.1:9384/xxl-job-admin
    # 调度中心的访问令牌，为空则不启用
    accessToken: 
    # 执行器配置
    executor:
      appname: xxl-job-executor-sample  # 该执行器的名称
      address: ""  # 该执行器的外部访问地址，如果为空，则该执行器只能被本地访问
      ip: ""  # 执行器的IP地址，为空则为本机ip
      port: 9999  # 执行器的端口，调度中心在调度任务时会访问该端口
      logpath: /data/applogs/xxl-job/jobhandler  # 执行器日志存储路径
      logretentiondays: 30  # 执行器日志保存天数
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

















