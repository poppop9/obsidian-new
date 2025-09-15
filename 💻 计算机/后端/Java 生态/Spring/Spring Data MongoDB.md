```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

# ❤️ yml 配置
```yml
spring:
  data:
    mongodb:
      host: localhost
      port: 27017
      database: testdb
      username: yourUsername
      password: yourPassword
      authentication-database: admin  # 认证数据库，默认是 admin
```

# ❤️ 实体类
- 类注解
	- `@Document` 表明文档，指定集合
- 属性注解
	- `@MongoId` 指定主键 id
	- `@Field` 指定字段在 MongoDB 中的名称
- `@Version` 用于实现乐观锁，字段值每次更新时自增，用于并发控制

```java
@Document("test_collection")
public class User {
    @MongoId
    private String id;
    @Field("user_name")
    private String name;
    private int age;
}
```

# ❤️ 基础 CRUD
## 💛 MongoRepository
MongoRepository 类似于 JpaRepository
```java
public interface UserRepository extends MongoRepository<User, String> {
    User findByName(String name);
}
```

## 💛 MongoTemplate
MongoTemplate 是底层模板类，提供了丰富的 MongoDB 操作方法 

<u>保存</u> ：
- `insert()` 主键存在就抛异常
- `save` 主键存在就更新
```java
// 不需要给 id 赋值，mongodb 会自动生成主键 id
Employee emp4 = new Employee().setWorkNo("nb004")
		.setName("乔豆豆")
		.setDepart("财务部")
		.setAge(39)
		.setMoney(1800);
mongoTemplate.save(emp4);
```

<u>删除</u> ：
```java
DeleteResult remove = mongoTemplate.remove(对象);
```

<u>更新</u> ：
```java
// 将年龄在 30 岁以下的员工，薪水增加 100 元，部门改为大数据部门
UpdateResult updateResult = mongoTemplate.updateMulti(
    Query.query(Criteria.where("age").lt(30)),
    new Update().inc("money", 100).set("depart", "大数据部门"),
    Employee.class
);
```

<u>查询</u> ：
- 普通查询 / 条件查询
```java
// 查询所有员工
List<Employee> list = mongoTemplate.findAll(Employee.class);

// 条件查询：查询研发部，并且年龄大于 30 岁的员工，按照年龄倒序排列
List<Employee> list = mongoTemplate.find(
    Query.query(Criteria.where("depart").is("研发部").and("age").gt(30))
         .with(Sort.by(Sort.Direction.DESC, "age")),
    Employee.class
);
```
- 计数
```java
long total = mongoTemplate.count(
	Query.query(Criteria.where("money").gt(2000)),
	Employee.class
);
```
- 分页查询
```java
int page = 2;
int size = 2;
Query query = new Query(criteria)
		.skip((page - 1) * size) //跳过多少条
		.limit(size) //返回多少条
		.with(Sort.by(Sort.Order.asc("money")));
List<Employee> list = mongoTemplate.find(query, Employee.class);
```

# ❤️ 高阶功能
## 💛 Criteria 复杂查询条件
- 多条件组合
- 嵌套文档查询
```java
{
  "name": "Tom",
  "address": {
    "city": "Tokyo",
    "zip": "100-0001"
  }
}

List<User> users = mongoTemplate.find(
	Query.query(Criteria.where("address.city").is("Tokyo")),
    User.class
);
```

```java
{
  "name": "Alice",
  "orders": [
    { "product": "Book", "price": 100 },
    { "product": "Pen", "price": 10 }
  ]
}

// 流式风格更加推荐
List<User> users = mongoTemplate.query(User.class)
    .matching(Query.query(Criteria.where("orders.product").is("Pen")))
    .all();
```

- 条件动态拼接
```java
List<Criteria> criterias = new ArrayList<>();
// 条件动态拼接
if (age != null) criterias.add(Criteria.where("age").gt(age));
if (name != null) criterias.add(Criteria.where("name").regex(name));

// 将收集到的所有条件组合为 AND 条件
new Criteria().andOperator(criterias.toArray(new Criteria[0]));
```

## 💛 BasicQuery
BasicQuery 是原生的 json 查询方法，非常复杂，但是功能很丰富

```java
BasicQuery query = new BasicQuery("{ age : { $lt : 30 }, name : { $regex : 'l' }}");
List<Person> result = mongoTemplate.find(query, Person.class);
```

## 💛 聚合查询
- 聚合统计数量
```java
// 统计各个部门的人数
AggregationOperation group = Aggregation.group("depart").count().as("empCount");
Aggregation aggregation = Aggregation.newAggregation(group);
AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, Employee.class, Map.class);
for (Map result : results.getMappedResults()) {
	System.out.println(result);
}

---
{ "name": "张三", "depart": "研发部" }
{ "name": "李四", "depart": "研发部" }
{ "name": "王五", "depart": "市场部" }

{_id=研发部, empCount=2}
{_id=市场部, empCount=1}
```
- 聚合统计最大值
```java
// 统计每个部门，最高的薪水是多少，这里使用的是 max ，当然你也可以使用 min（最小），sum(总和)，avg（平均）等方法
AggregationOperation group = Aggregation.group("depart").max("money").as("maxMoney");
Aggregation aggregation = Aggregation.newAggregation(group);
AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, Employee.class, Map.class);
for (Map result : results.getMappedResults()) {
	System.out.println(result);
}

---
{ "name": "张三", "depart": "研发部" , "money": 5000 }
{ "name": "李四", "depart": "研发部" , "money": 7000 }
{ "name": "王五", "depart": "市场部" , "money": 6000 }

{_id=开发部, maxMoney=7000}
{_id=市场部, maxMoney=6000}
```
- 聚合随机获取数据
```java
// 随机获取 3 个人的信息
TypedAggregation aggregation = Aggregation.newAggregation(Employee.class, Aggregation.sample(3));
AggregationResults<Employee> results = mongoTemplate.aggregate(aggregation, Employee.class);
List<Employee> list = results.getMappedResults();
```
- 有条件地聚合随机获取数据
```java
// 随机获取 2 个年龄大于 26 岁的员工
TypedAggregation<Employee> aggregation = TypedAggregation.newAggregation(
    Employee.class,
    Aggregation.match(Criteria.where("age").gt(26)),
    Aggregation.sample(2)
);

List<Employee> list = mongoTemplate.aggregate(aggregation, Employee.class).getMappedResults();
```

## 💛 动态字段
- 使用 Document 类型，推荐用于字段完全动态的情况
```java
Document doc1 = new Document();
doc1.append("name", "Alice");
doc1.append("age", 25);
mongoTemplate.insert(doc1, "my_collection");
```
- 使用 Map
```java
Map<String, Object> doc1 = new HashMap<>();
doc1.put("name", "Charlie");
doc1.put("active", true);
mongoTemplate.save(doc1, "my_collection");
```
- **推荐**使用动态保留字段，但是不能平铺到顶层
```java
@Document("my_collection")
public class MyDynamicEntity {
    private String name;
    private Integer age;
    private Map<String, Object> properties;
}

{
  "name": "Alice",
  "age": 25,
  "properties": {
    "customField1": "value1",
    "customField2": 123
  }
}
```

# ❤️ 其他
https://cloud.tencent.com/developer/article/2441738

https://www.hxstrive.com/subject/spring_data_mongodb/1980.htm




