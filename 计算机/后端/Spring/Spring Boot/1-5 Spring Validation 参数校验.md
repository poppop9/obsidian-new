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
 * 更改参数校验器的异常（默认抛出的异常是ConstraintViolationException，不够详细
 */
@Bean
public static MethodValidationPostProcessor validationPostProcessor() {
	MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
	processor.setAdaptConstraintViolations(true);
	return processor;
}
```

```java
/**  
 * 全局异常处理器  
 */  
@Slf4j  
@RestControllerAdvice  
public class GlobalExceptionHandler {
    /**
     * 处理基本数据类型参数校验异常
     */
    @ExceptionHandler(MethodValidationException.class)
    public ResponseEntity<JsonNode> constrainViolationHandler(MethodValidationException e) {
        String details = e.getAllValidationResults().stream().map(item -> item.getResolvableErrors().stream().findFirst().get().getDefaultMessage()).collect(Collectors.joining(", "));

        System.out.println(e.getClass().getName() + ": " + details + "。" + e.getMessage());
        Arrays.stream(e.getStackTrace()).forEach(stackTraceElement -> {
            System.out.printf("\tat %s.%s(%s:%d) %s%n",
                    stackTraceElement.getClassName(),
                    stackTraceElement.getMethodName(),
                    stackTraceElement.getFileName(),
                    stackTraceElement.getLineNumber(),
                    stackTraceElement.isNativeMethod() ? "~[na:na]" : "~[classes/:na]"
            );
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(objectMapper.createObjectNode()
                        .put("message", details + "。" + e.getMessage())
                );
    }
}
```

# ❤️ 校验
- `@Validated` 
- `@Valid` 
- 参数校验
	- **空值**
		- `@Null` 值必须是 null
		- `@NotNull` 
		- `@NotBlank` 
		- `@NotEmpty` 
	- **数值**
		- `@Size` 
			- min
			- max
		- `@Min` / `@Max` 
			- value
	- **格式**
		- `@Email` 
		- `@EnumValue` 必须在指定的元素范围内
			- value
		- `@Positive` / `@PositiveOrZero` / `@Negative` / `@NegativeOrZero` 必须是一个数字，且是一个正数/正数或零/负数/负数或零
		- `@AssertTrue` / `@AssertFalse` 必须是 true / false
		- `@Past` / `@Future` 必须是一个过去/将来的日期

## 💛 Controller 校验
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

## 💛 其他方法校验
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


