```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

implementation 'org.springframework.boot:spring-boot-starter-validation'
```

# ❤️ 配置
最好是配置一个全局异常处理器，这样参数校验时的报错才是明确的

```java
/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Resource
    private ObjectMapper objectMapper;

    /**
     * 处理基本数据类型参数校验异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<JsonNode> constrainViolationHandler(ConstraintViolationException e) {
        log.error("参数校验异常 : {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(objectMapper.createObjectNode()
                        .put("message", e.getMessage())
                );
    }
}
```

- `@Validated` **一定在类上加这个注解，校验参数的具体 message 才会返回**
- `@Valid` 
- 参数校验
	- `@NotBlank` 
	- `NotNull` 
	- `@Size` 
		- min
		- max
	- `@Min` / `@Max` 
		- value
	- `@Email` 

# ❤️ Controller 校验
- 类上加 `@Validated` 
- 校验字段上加入对应的注解

```java
@Validated
@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/v1/testParamCheck")
    public void testParamCheck(@NotBlank(message = "var1 不能是无效文本") String var1,
                               @NotNull(message = "var2 不能为 null") String var2) {
        System.out.println("var1: " + var1);
        System.out.println("var2: " + var2);
    }
}
```


# ❤️ 其他方法校验
- 类上加 `@Validated` 
- 调用这个方法时，一定是通过 Spring Bean 来调用的

```java
void test(@NotBlank(message = "var3 不能是无效文本") String var3) {
	System.out.println("var3: " + var3);
}
```


---

https://developer.aliyun.com/article/1135202
https://developer.aliyun.com/article/1228487

```java
@Configuration
public class ApplicationConfiguration {
	@Bean
	public static MethodValidationPostProcessor validationPostProcessor() {
		MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
		processor.setAdaptConstraintViolations(true);
		return processor;
	}
}
```
