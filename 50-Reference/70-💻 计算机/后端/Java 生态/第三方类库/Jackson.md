
$$
Jackson 是用来序列化和反序列化 JSON 的
$$

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-core</artifactId>
  <version>2.17.0</version>
</dependency>
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-annotations</artifactId>
  <version>2.17.0</version>
</dependency>
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.17.0</version>
</dependency>
```

- 序列化：将 Java 对象转换为 Json 格式的字符串
- 反序列化：将 JSON 格式的字符串转换回对应的 Java 对象

# ❤ ObjectMapper

> [!hint] 忽略 JSON 中的某些字段
> 有时候，JSON 中的字段非常冗余，我们只需要将一小部分字段写入到 Java 对象中。这时，可以忽略额外的字段：
> ```java
>objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
> ```

## 💛 反序列化：JSON -> Bean
### JSON 字符串 -> Java 对象
```java
// Car 类
public class Car {
	private String brand = null;
    private int doors = 0;

	// get，set 方法……
}

// 测试
String carJson ="{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";
Car car = new ObjectMapper().readValue(carJson, Car.class);

System.out.println("car brand = " + car.getBrand());
System.out.println("car doors = " + car.getDoors());
```

### JSON 输入流 -> Java 对象
- 字节流
```java
InputStream input = new FileInputStream("data/car.json");
 
Car car = new ObjectMapper().readValue(input, Car.class);
```

- 字符流
```java
ObjectMapper objectMapper = new ObjectMapper();
 
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 4 }";
Reader reader = new StringReader(carJson);

Car car = objectMapper.readValue(reader, Car.class);
```

### JSON 文件 -> Java 对象
- 本机文件
```java
ObjectMapper objectMapper = new ObjectMapper();
 
File file = new File("data/car.json");
 
Car car = objectMapper.readValue(file, Car.class);
```

- 网络文件
```java
ObjectMapper objectMapper = new ObjectMapper();
 
URL url = new URL("http://jenkov.com/some-data.json");
 
Car car = objectMapper.readValue(url, Car.class);
```

### JSON 二进制数组 -> Java 对象
```java
ObjectMapper objectMapper = new ObjectMapper();
 
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";
 
byte[] bytes = carJson.getBytes("UTF-8");
 
Car car = objectMapper.readValue(bytes, Car.class);
```

### JSON 字符串数组 -> Java 对象数组
```java
ObjectMapper objectMapper = new ObjectMapper();

String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";

Car[] cars2 = objectMapper.readValue(jsonArray, Car[].class);
```

## 💛 JSON -> 集合
### JSON 字符串数组 -> List
```java
ObjectMapper objectMapper = new ObjectMapper();

String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";
 
List<Car> cars1 = objectMapper.readValue(jsonArray, new TypeReference<List<Car>>(){});
```

### JSON 字符串 -> Map
```java
ObjectMapper objectMapper = new ObjectMapper();

String jsonObject = "{\"brand\":\"ford\", \"doors\":5}";

// new TypeReference<Map<String,Object>>(){} 就是在告诉Jackson，你想要什么类型
Map<String, Object> jsonMap = objectMapper.readValue(jsonObject, new TypeReference<Map<String,Object>>(){});
```

## 💛 序列化：Bean -> JSON
- `writeValue()` 
- `writeValueAsString(Object)` 将生成的 JSON 作为 `String` 返回
- `writeValueAsBytes(Object)` 将生成的 JSON 作为字节数组返回

```java
ObjectMapper objectMapper = new ObjectMapper();
 
Car car = new Car();
car.setBrand("BMW");
car.setDoors(4);

// 将car对象序列化为JSON，并写入到名为 "data/output-2.json" 的文件中
objectMapper.writeValue(new FileOutputStream("data/output-2.json"), car);

// 将car对象序列化为JSON，并转换为String
String json = objectMapper.writeValueAsString(car);
System.out.println(json);
```

> [!warning] Jackson 的日期转换
> Jackson 默认会将 `java.util.Date` 对象序列化为 `long` 毫秒数。但是，我们大多数时候希望能将 `java.util.Date` 转换为日期格式的字符串
> 
> - 默认
> ```java
> ObjectMapper objectMapper = new ObjectMapper();
> 
> Transaction transaction = new Transaction("transfer", new Date());
> 
> String output = objectMapper.writeValueAsString(transaction);
> System.out.println(output);
> ```
> 
> - 改进
> ```java
> ObjectMapper objectMapper = new ObjectMapper();
> 
> Transaction transaction = new Transaction("transfer", new Date());
> 
> // 设置日期格式
> SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
> // 在objectMapper中设置日期格式
> objectMapper.setDateFormat(dateFormat);
> 
> String output2 = objectMapper.writeValueAsString(transaction);
> System.out.println(output2);
> ```

# ❤ JsonNode 树模型

> [!quote] 树模型
> 
> > 树模型 由 JsonNode 类表示，可用于表示 JSON 对象
> 
> **使用场景**：
> - 不知道接收到的 JSON 格式
> - 不想多创建一个类

## 创建树模型
- json 字符串转 JsonNode
```java
JsonNode arrayNode = objectMapper.readTree( 字符串…… );
```

## 浏览树模型
- **获取字段**
	- `JsonNode.get("字段名")` <u>根据字段名</u>获取 JSON 的字段
	- `JsonNode.get(索引)` 如果一个 JsonNode 对象是数组，可以使用 get 来获取到指定的元素
	- `JsonNode.at("JSON 路径")` 根据路径获取 JSON 的字段【例如 `/nestedObject/value`】
- **获取字段里的内容**
	- `jsonNode.asText();` 获取对应字段的内容为 `String`
	- `jsonNode.asDouble();` 获取对应字段的内容为 `double`
	- `jsonNode.asInt();` 获取对应字段的内容为 `int`
	- `jsonNode.asLong();` 获取对应字段的内容为 `long`
- **遍历**
	- `Iterator<Map.Entry<String, JsonNode>> fields()` 返回一个迭代器，里面是 JsonNode 对象的所有键值对集合
		- `Map.Entry<String, JsonNode> next()` 一个个遍历，获取到 Entry 对象
	- `Iterator<String> fieldNames` 返回一个迭代器，里面是 JsonNode 对象的所有键集合

```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5," +
        "  \"owners\" : [\"John\", \"Jack\", \"Jill\"]," +
        "  \"nestedObject\" : { \"field\" : \"value\" } }";

try {
    JsonNode jsonNode = objectMapper.readValue(carJson, JsonNode.class);

	// 访问 JSON 字段
    JsonNode brandNode = jsonNode.get("brand");
    String brand = brandNode.asText();
    System.out.println("brand = " + brand);
 
    JsonNode doorsNode = jsonNode.get("doors");
    int doors = doorsNode.asInt();
    System.out.println("doors = " + doors);

	// 访问 JSON 数组
    JsonNode array = jsonNode.get("owners");
    JsonNode jsonNode = array.get(0);
    String john = jsonNode.asText();
    System.out.println("john  = " + john);

	// 访问 JSON 嵌套对象
    JsonNode child = jsonNode.get("nestedObject");
    JsonNode childField = child.get("field");
    String field = childField.asText();
    System.out.println("field = " + field);
 
} catch (IOException e) {
    e.printStackTrace();
}
```

## 💛 Java 对象 -> JsonNode
```java
Car car = new Car();
car.brand = "Cadillac";
car.doors = 4;

JsonNode carJsonNode = new ObjectMapper().valueToTree(car);
```

## 💛 All -> All
```java
List<Integer> list = objectMapper.convertValue(jsonNode.get("dirInfoIdList"), new TypeReference<List<Integer>>() {
})
```

# ❤ ObjectNode 子树模型
JsonNode 里的属性是不可修改的，所以引入 ObjectNode，ObjectNode 是 JsonNode 的子类

> [!warning] ObjectNode 如果有值为 null ，或者无效字符，执行 `toString()` 时就会报错，只能使用 `writeValueAsString(ObjectNode)` 来转字符串

## 创建
- `new ObjectMapper().createObjectNode()` 创建一个空的 ObjectNode
- `new ObjectMapper().<ObjectNode>valueToTree(Object)` Object 转 ObjectNode
- 将 JsonNode 强转为 ObjectNode

## 添加/修改
- `put()` 
- `putIfAbsent(键，值)` 获取该键，如果这个键没有值，则将该值 set 进去；反之，不做任何操作

```java
// 如果ObjectNode中没有 'field1' 字段，那就向 `ObjectNode` 中添加一个 "field1" 字段，并将字符串 "value1" 作为它的值
// 如果ObjectNode中存在 'field1' 字段，那就修改其值
objectNode.put("Math", "value1");
```

---

- `putObject(键)` 在当前的 ObjectNode 上添加一个 ObjectNode 对象，并返回
```java
ObjectNode objectNode = new ObjectMapper().createObjectNode();
ObjectNode child = objectNode.putObject("address")
		.put("street", "123 Main Street")
		.put("city", "Springfield")

System.out.println(child.toString());

---
{"street":"123 Main Street","city":"Springfield"}
```

---

- `putPOJO(键，java对象)` 自动序列化 java 对象
```java
ObjectNode objectNode = new ObjectMapper().createObjectNode();  
Customer johnDoe = new Customer().builder()  
        .id(1L)  
        .no(100L)  
        .custName("John Doe")  
        .custAddress("123 Main Street")  
        .build();  
objectNode.putPOJO("customer", johnDoe);  
System.out.println(objectNode.toPrettyString());

---
{
  "customer" : {
    "id" : 1,
    "no" : 100,
    "custName" : "John Doe",
    "custAddress" : "123 Main Street"
  }
}
```

---

- `setAll(ObjectNode)` 直接 set 一个 ObjectNode 对象，这样不会像 putPOJO 一样多一层 Key，如果遇到 Key 相同就会覆盖
- `putAll(ObjectNode)` 作用与 setAll 相同，只是遇到 Key 相同就跳过
```java
ObjectNode objectNode = new ObjectMapper().createObjectNode();
ObjectNode childNode = new ObjectMapper().createObjectNode();
childNode.put("name", "Java");
childNode.put("age", "123");

objectNode.put("address", "abc");
objectNode.setAll(childNode);

System.out.println(objectNode.toPrettyString());

---
{
  "address" : "abc",
  "name" : "Java",
  "age" : "123"
}
```

## 删除
```java
objectNode.remove("Math");
```

## 迭代
```java
// 生成迭代器
Iterator<String> fieldNames = jsonNode.fieldNames();

while(fieldNames.hasNext()) {
    String fieldName = fieldNames.next();

	// 通过迭代器找到的字段名，创建字段JsonNode
    JsonNode field = jsonNode.get(fieldName);
}
```

# ❤ ArrayNode
```java
ArrayNode arrayNode = objectMapper.createArrayNode();

arrayNode.add("apple");
arrayNode.add(objectNode);
```

```java
ArrayNode arrayNode = (ArrayNode) objectMapper.readTree(json);
```

# ❤ TextNode
只有文本值的 JsonNode 就是 TextNode

```java
ObjectNode objectNode = new ObjectMapper().createObjectNode();  
objectNode.putIfAbsent("name", new TextNode("John Doe"));  
  
if (objectNode.get("name").isTextual()) {  
    System.out.println(objectNode.get("name").asText());  
}
```


# ❤️ 注解
## 通用注解
通用注解表示在序列化，和反序列化时都生效

 - `@JsonProperty` 会匹配类属性名，和 JSON 字段名
```java
@JsonProperty("birth_date")
private Date birthDate;
```

- `@JsonIgnore` 用于忽略 Java 对象的某个属性
```java
public class PersonIgnore {
	// 不会从JSON读取属性personId，和写入JSON属性personId
    @JsonIgnore
    public long personId = 0;
    public String name = null;
}
```

- `@JsonIgnoreProperties` 用于指定要忽略的类的属性列表
```java
// 属性 firstName 和 lastName 都将被忽略
@JsonIgnoreProperties({"firstName", "lastName"})
public class PersonIgnoreProperties {
    public long personId = 0;
    public String firstName = null;
    public String lastName = null;
}
```

- `@JsonIgnoreType` 忽略整个类
```java
public class PersonIgnoreType {
    @JsonIgnoreType
    public static class Address {
        public String streetName = null;
        public String houseNumber = null;
        public String zipCode = null;
        public String city = null;
        public String country = null;
    }

    public long personId = 0;
    public String name = null;
    public Address address = null;
}
```

- `@JsonTypeInfo` 可以在序列化和反序列化时，保存并解析某个字段的具体类型（~~比如类使用了泛型，如果不使用 @JsonTypeInfo，在反序列化时，则会将复杂字段反序列化为 LinkedHashMap~~），原理就是在序列化时，多序列化一个键值对（key 为 property 设置的值，value 为 use 设置的值）
	- `use` 
		- JsonTypeInfo.Id.CLASS 设置为对象的全限定类名
	- `property` 
		- @class 对象的全限定类名的 key 为 @class

## 反序列化注解
反序列化注解只有在<u>反序列化</u>时生效

### @JsonSetter
`@JsonSetter` 将 `setter方法` 的名称与 JSON 数据中的属性名匹配

```json
{
  "id": 1234,
  "name": "John"
}
```

```java
public class Person {
    private long personId = 0;
    private String name = null;

    public long getPersonId() {
        return this.personId;
    }

    @JsonSetter("id")
    public void setPersonId(long personId) {
        this.personId = personId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

### @JsonAnySetter
`@JsonAnySetter` 用于属性或者方法，接收未知属性的键值对

```java
// 如果 JSON 中包含了额外属性，这些额外属性会被动态地添加到Map集合中
@JsonAnySetter 
public void set(String key, Object value) {   
	map.put(key, value); 
}
```

## 序列化注解
序列化注解只有在<u>序列化</u>时生效

### @JsonValue
`@JsonValue` 使用这个注解标记的 属性/方法 将会作为整个类序列化的结果

```java
@Data
public class User {
    private String name;
    private int age;

    // 这个方法返回的值将被用作 JSON 序列化的结果
    // name和age属性不会被序列化为json
    @JsonValue
    public String getCustomSerialization() {
        return name + " is " + age + " years old.";
    }
}
```

```java
public enum UserStatus {
	NORMAL(1, "正常"),
	LOCKED(2, "锁定"),
	FROZEN(3, "冻结");

	// status将会代表整个UserStatus类返回
	@JsonValue
	private final int status;
	private final String description;

	UserStatus(int status, String description) {
		this.status = status;
		this.description = description;
	}
}
```

### @JsonFormat
`@JsonFormat` 在序列化时，转换属性/方法返回值的格式

```java
@JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm")
public Date getBirthDate()

@JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime activityOrderExpireTime;  // 活动单过期时间
```

### @JsonPropertyOrder
`@JsonPropertyOrder` 用于类，指定属性在序列化时 JSON 中的顺序

```java
@JsonPropertyOrder({ "birth_date", "name" }) 
public class Person
```

### @JsonRawValue
`@JsonRawValue` 会使该属性值直接写入 JSON ，而不是加 `""`

```java
public class PersonRawValue {
    public long personId = 0;
    public String address = "$#";
}

---
{"personId":0,"address":"$#"}
```

```java
import com.fasterxml.jackson.annotation.JsonRawValue;

public class PersonRawValue {
    public long personId = 0;
    @JsonRawValue
    public String address = "$#";
}

---
{"personId":0,"address":$#}
```

```java
public class PersonRawValue {
    public long personId = 0;
    @JsonRawValue
    public String address = "{\"street\":\"Wall Street\",\"no\":1}";
}

---
{
  "personId": 0,
  "address": {
    "street": "Wall Street",
    "no": 1
  }
}
```









