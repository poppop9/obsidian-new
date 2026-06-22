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

以下 Dubbo 默认使用 Nacos 作为注册中心

# ❤️ 配置
- 指定 registry.address 后，无需再使用 nacos client 手动注册
- register-mode
	- `instance` 仅进行应用级注册
	- `interface` 仅进行接口级注册
	- `all` 同时进行应用级和接口级注册

```yml
dubbo:
  application:
    name: big-market-app  # 应用名称
  registry:
    address: nacos://192.168.0.12:8848  # 服务注册中心的地址
    parameters.namespace: f1680a4a-b6f6-49ec-a747-aa35a219570a
    register-mode: all  # 注册模式
  config-center:
    address: nacos://192.168.0.12:8848  # 配置中心的地址，用于集中管理、动态调整 Dubbo 的配置信息
```

[更多配置](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/registry/nacos/#25-%E6%9B%B4%E5%A4%9A%E9%85%8D%E7%BD%AE)

# ❤️ 使用
## 💛 注册服务
- 主类开启注解 `@EnableDubbo` 
- 添加服务提供者（**不添加是无法将该服务实例注册到 Nacos 的**）
```java
@DubboService
public class SecurityService implements ISecurityService { …… }
```

> [!quote] `@DubboService` 
> <u>属性值</u> ：
> - interfaceClass 指定要注入的接口服务
> 
> <u>注意</u> ：一个 @DubboService 只能注册一个服务，也就是说只能注册 IRaffleArmory 、或者 IRaffleDispatch 其中一个
> ```java
> @DubboService
> public class RaffleArmoryDispatch implements IRaffleArmory, IRaffleDispatch {
> ```

## 💛 服务调用








