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

# ❤️ 工具类
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

<u>查询</u> ：
```java
//查询所有员工
@Test
public void testFindAll() {
	List<Employee> list = mongoTemplate.findAll(Employee.class);
	for (Employee emp : list) {
		System.out.println(emp);
	}
}

//条件查询：查询【研发部】，并且年龄大于 30 岁的员工，按照年龄【倒序】排列
@Test
public void testFindWhere() {
	Criteria criteria = Criteria.where("depart").is("研发部").and("age").gt(30);
	Query query = new Query(criteria).with(Sort.by(Sort.Order.desc("age")));
	List<Employee> list = mongoTemplate.find(query, Employee.class);
	for (Employee emp : list) {
		System.out.println(emp);
	}
}

//将年龄在 30 岁以下的员工，薪水增加 100 元，部门改为大数据部门
@Test
public void testUpdate() {
	Query query = Query.query(Criteria.where("age").lt(30));
	Update update = new Update();
	update.inc("money", 100);
	update.set("depart", "大数据部门");

	UpdateResult updateResult = mongoTemplate.updateMulti(query, update, Employee.class);
	//打印修改的文档数量
	System.out.println(updateResult.getModifiedCount());
}

//分页查询（查询薪水大于等于 2000 的员工，按照薪水【升序】排列）
@Test
public void testPage() {
	int page = 2;
	int size = 2;

	Criteria criteria = Criteria.where("money").gt(2000);
	Query queryCount = new Query(criteria);
	long total = mongoTemplate.count(queryCount, Employee.class);
	System.out.println("一共有 " + total + " 条记录，其中第 " + page + " 页的结果为：");

	Query queryLimit = new Query(criteria)
			.skip((page - 1) * size) //跳过多少条
			.limit(size) //返回多少条
			.with(Sort.by(Sort.Order.asc("money")));

	List<Employee> list = mongoTemplate.find(queryLimit, Employee.class);
	for (Employee emp : list) {
		System.out.println(emp);
	}
}

//统计每个部门的人数
@Test
public void testGroupCout() {
	// 统计各个部门的人数
	AggregationOperation group = Aggregation.group("depart").count().as("empCount");
	// 将操作加入到聚合对象中
	Aggregation aggregation = Aggregation.newAggregation(group);
	// 执行聚合查询
	AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, Employee.class, Map.class);
	for (Map result : results.getMappedResults()) {
		System.out.println(result);
	}
}

//统计每个部门，最高的薪水是多少
@Test
public void testGroupMax() {
	//这里使用的是 max ，当然你也可以使用 min（最小），sum(总和)，avg（平均）等方法
	AggregationOperation group = Aggregation.group("depart").max("money").as("maxMoney");
	Aggregation aggregation = Aggregation.newAggregation(group);
	AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, Employee.class, Map.class);
	for (Map result : results.getMappedResults()) {
		System.out.println(result);
	}
}

//随机获取 3 个人的信息
@Test
public void testGetRandomData() {
	//创建统计对象，设置统计参数，sample 表示随机获取数据
	TypedAggregation aggregation = Aggregation.newAggregation(Employee.class, Aggregation.sample(3));
	//调用mongoTemplate方法统计
	AggregationResults<Employee> results = mongoTemplate.aggregate(aggregation, Employee.class);
	//获取统计结果
	List<Employee> list = results.getMappedResults();
	//循环打印出来
	list.forEach(System.out::println);
}

//随机获取 2 个年龄大于 26 岁的员工
@Test
public void testGetWhereRandomData() {

	Criteria criteria = Criteria.where("age").gt(26);
	TypedAggregation<Employee> aggregation =
			TypedAggregation.newAggregation(Employee.class,
					Aggregation.match(criteria), Aggregation.sample(2));

	AggregationResults<Employee> results = mongoTemplate.aggregate(aggregation, Employee.class);
	List<Employee> list = results.getMappedResults();
	list.forEach(System.out::println);
}

//删除【薪水最高】的老油条员工
@Test
public void testDelete() {
	//先找到薪水最高的老油条员工
	Query maxQuery = new Query().with(Sort.by(Sort.Order.desc("money")));
	Employee one = mongoTemplate.findOne(maxQuery, Employee.class);
	//打印出老油条员工
	System.out.println(one);

	if (one != null) {
		//这里直接删除了，当然你也可以再通过查询条件，比如主键 id 进行删除
		DeleteResult remove = mongoTemplate.remove(one);
		//打印出删除的文档数量
		System.out.println(remove.getDeletedCount());
	}
}~
```

# ❤️ 高阶功能
## Criteria 复杂查询条件
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

Query query = new Query();
query.addCriteria(Criteria.where("address.city").is("Tokyo"));
List<User> users = mongoTemplate.find(query, User.class);
```

```java
{
  "name": "Alice",
  "orders": [
    { "product": "Book", "price": 100 },
    { "product": "Pen", "price": 10 }
  ]
}

Query query = new Query();
query.addCriteria(Criteria.where("orders.product").is("Pen"));
List<User> users = mongoTemplate.find(query, User.class);
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

## 动态字段
- 使用Document 类型，推荐用于字段完全动态的情况
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

- 使用动态保留字段，但是不能平铺到顶层
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




