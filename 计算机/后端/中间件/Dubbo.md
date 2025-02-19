```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.3.3</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    <version>3.3.3</version>
</dependency>

%% <dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-nacos</artifactId>
    <version>3.3.3</version>
</dependency>
<dependency>
    <groupId>com.alibaba.spring</groupId>
    <artifactId>spring-context-support</artifactId>
    <version>1.0.11</version>
</dependency> %%
```

# ❤️ 配置
<u>配置注册中心</u> ：
- 指定 registry.address 后无需使用 nacos 的 NamingService 手动注册
```yml
dubbo:
  registry:
    address: nacos://your_nacos_server_ip:8848  # 服务注册中心的地址
  config-center:
    address: nacos://your_nacos_server_ip:8848  # 配置中心的地址，用于集中管理、动态调整 Dubbo 的配置信息
```


