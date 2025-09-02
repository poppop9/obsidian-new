```xml  
// 不用指定版本号，因为在SpringBoot的父工程里已经集成了lombok
<dependency>  
    <groupId>org.projectlombok</groupId>  
    <artifactId>lombok</artifactId>   
</dependency>           
```

> [!quote] Lombok
> Lombok 可以通过注解来简化 Java 类的编写，提高代码的可读性和简洁性

# 构造方法
- `@NoArgsConstructor` 为实体类生成无参构造方法
	- `force` 
		- true 即使该类有一个 final 字段也强制生成一个无参构造
	- `access` 设置无参构造的访问修饰符
		- lombok.AccessLevel.PROTECTED
		- lombok.AccessLevel.PRIVATE
- `@AllArgsConstructor` 为实体类生成除了 static 修饰的字段之外带有所有参数的构造方法
	- `access` 设置有参构造的访问修饰符
- `@RequiredArgsConstructor` 生成只有 final，或者 `@NonNull` 标注的参数构造方法

```java
@RequiredArgsConstructor  
public class User implements Serializable {  
    private Integer id;  
    @NonNull  
    private String name;  
    @NonNull  
    private String password;  
    @NonNull  
    private Integer authority;  
}
```

# 属性
## @Data
- `@Data` 是 @Getter+@Setter+@ToString+@EqualsAndHashCode 的集合
	- `@Getter/@Setter` 为所有属性提供 get/set 方法
	- `@ToString` 给类自动生成的 toString 方法
	- `@EqualsAndHashCode` 根据类所拥有的非静态字段重写 equals 方法和 hashCode 方法

## @Builder
`@Builder` 可以自动生成一个建造者模式相关的代码【~~不需要手动 setter 构建对象，而是链式调用来构建对象~~】，使得对象的构建更加简洁
- Default 给属性设置默认值。如果创建对象时，没有传，则为默认值。**但是只有在使用 builder 构建对象时才能生效**

```java
// Person类
@Builder
public class Person {
    private String name;
    private int age;
    private String address;
	@Builder.Default
    private Long raffleTimes = 0L;
}

// 构建对象
Person person = Person.builder()
                      .name("张三")
                      .age(25)
                      .address("北京")
                      .build();
```

## @SuperBuilder
用于支持继承的 Builder 模式，可以构建父类字段。子类使用 @SuperBuilder 时，父类也必须使用 @SuperBuilder

## @Accessors
`@Accessors` 可以调整生成的 `getter` 和 `setter` 方法的命名和访问方式
- fluent
	- true 生成的 getter 方法没有 get 前缀
- chain
	- true 使得 setter 方法可以链式调用

```java
@Data
@Accessors(fluent = true, chain = true)
public class User {
    private String firstName;
    private String lastName;
}

// 使用
User user = new User().setFirstName("John").setLastName("Doe");
String s = user.firstName();
```

# 清理
`@Cleanup` 能够自动释放资源，默认调用的是 `close()` 方法，如果该资源销毁调用的是其他方法，那就 `@Cleanup(“methodName”)` 

```java
@Cleanup InputStream in = new FileInputStream(args[0]);
```

# 异常
`@SneakyThrows` 能够自动地将方法中可能抛出的 checked 异常（编译时异常）自动进行 try catch，**这样就不用一个地方抛异常，所有调用这个方法的地方也都要抛异常**

```java
@SneakyThrows
public void run() {
	throw new Throwable();
}

// 编译后得到
public void run() {
	try {
		throw new Throwable();
	} catch (Throwable var2) {
		throw var2;
	}
}
```







