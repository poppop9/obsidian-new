
$$
DDD 就是领域驱动设计，Domain，Driven，Design
$$

# ⚖️ 对比 MVC ，DDD
✨️ 架构易拆分
- 传统的 MVC 架构**不灵活**：在项目推进的过程中，拆分功能会拆不动【A 功能，B 功能底层的调用会很混乱，会调到一起】
- 由于 DDD 架构是业务优先，所以拆分项目会很容易

✨️ 业务优先 ：MVC 架构的项目结构，一看是不知道这一块是干嘛的，DDD 架构是按业务划分的

# 💥 类爆炸
## 📖 方法一
看完 DDD 架构的设计原则，会发现本来 MVC 用一个 `Controller`，一个 `Service` 能解决的问题，DDD 要用 `interfaces`，`application`，充血模型，仓库，工厂……很多类来解决，所以我们引入了 <u>聚合</u>

> [!quote] 聚合
> 聚合 中包括<u>聚合根</u>【聚合内的一个对象，也是唯一对外开放的接口】，<u>各种值对象</u>，<u>各种实体</u>
> 
> - 减少类之间的依赖关系
> ![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202403302058399.png)

---

有个大商场【电商系统】：
- **购物车【订单聚合】**：购物车里可以有很多商品【订单项】，也可以包含支付方式……
- **购物车的把手【订单实体，即聚合根】**：顾客通过购物车的把手来推动购物车，而不是直接拿着商品走，购物车的把手是操作整个购物车的唯一方式【无论你是要添加商品、移除商品，还是查看支付信息】
- **商品和支付信息【订单项，支付方式值对象】**：它们属于购物车，但你不会直接拿着商品走向收银台支付，而是通过推动整个购物车来进行结算

## 📖 方法二
只有引起实体类属性值变化的业务【新增，删除……】才去按照 DDD 架构的条条框框去做，如果这个实体类只有查询，排序……，这些不引起实体类属性值变化的业务，那我们可以不要<u>充血模型</u>，`repository` ……，避免引入更多的类


# 📝 设计原则
- **单一职责原则**：一个类只做一件事【比如 A 类负责转账业务，那么只有转账业务流程发生变化了，才改动这个类，其他不管怎么变，A 类雷打不动】
- **开放封闭原则**：对扩展开放，对修改封闭【未来增加功能时，做到增加类，而不修改类】
- **依赖反转原则**：程序之间只依赖于抽象接口，而不依赖于具体的实现

## 📖 充血模型

> [!quote] 贫血模型
> 贫血模型就是只有属性，和 `get()` ，`set()` 方法的 POJO
> 
> ```java
> public class Account {
> 	private int id;
> 	private int balance;  // 余额
> 
> 	……对应的 get ，set 方法
> }
> ```
> 
> 当我们的业务多起来之后，这个 pojo 承载了哪些业务看不出来了，我需要到一个个 `Service` 中去找

---

> [!quote] 充血模型
> <u>充血模型</u> 就是把 pojo 的属性，以及引起属性的值发生变化的方法，写到 pojo 中。例如下面这个 pojo ，一看就知道有两个业务：
> 
> ```java
> public class Account {
> 	private int id;
> 	private int balance;  // 余额
> 
> 	……对应的 get ，set 方法
> 
> 	public void TransferIn(int money){
> 		balance = balance + money;
> 	}
> 
> 	public void TransferOut(int money){
> 		if(balance < money){
> 			throws new InsufficientMonryException();
> 		}
> 		balance = balance - money;
> 	}
> }
> ```
> 
> - 只有引起 pojo 属性值变化的方法，才写到 pojo 里

> [!warning] 一个充血模型只负责一个业务，如果有多个业务需要到同一个充血模型，那就每个业务创建一个<u>该业务需要用到的属性</u>的充血模型。但是多个相似的充血模型还是只会创建一个数据库表
> 
> ```java
> public class AccountOne {
> 	属性1;
> 	属性2;
> }
> 
> public class AccountTwo {
> 	属性3;
> 	属性4;
> }
> 
> // 数据库表
> 字段：属性1 属性2 属性3 属性4
> ```

## 📖 聚合
> [!quote] 聚合
> 聚合 是一组具有内聚性的相关<u>对象的集合</u>。当你对数据库的操作需要使用到多个实体时，可以创建聚合
> 
> - **聚合内事务一致性** ：在订单聚合内部，所有的操作【添加订单项、修改收货地址 ……】都由聚合根对象 Order 进行管理，并在同一个事务中完成
> - **聚合外最终一致性** ：在不同聚合之间的操作可能涉及多个事务，系统通过异步消息、事件驱动 ……来确保最终一致性，即使中间状态可能暂时数据不一致，但最终会达到一致

> [!quote] 聚合根
> 聚合根 是聚合中的一个比较特殊的实体对象，它管理着聚合内的其他实体对象，以确保其数据的一致性和完整性
> 
> - 负责创建、修改、删除聚合内的其他实体，并且只能通过聚合根来修改聚合内的实体对象

```java
// 聚合 = 聚合根 + 其他实体
// 聚合根
public class Order {
    private String orderId;
    private User user;
    private List<OrderItem> orderItems;
    private ShippingAddress shippingAddress;

    // 构造方法 ……
    // 其他业务逻辑方法 ……
}

// 用户实体
public class User {
    private String userId;
    private String name;

    // 构造方法 ……
    // 其他方法 ……
}

// 订单明细实体 ……
// 收货地址值对象 ……
```

### 📝 领域事件



### 📝 变更追踪
有时聚合内实体的变化（增删改）难以追踪，我们要用变更追踪器来管理，这样在 Repository 中 save 时可以更加容易

- 定义 EntityChangeTracker
```java
/**
 * 实体变更追踪 - 聚合根实现此接口，即可获得聚合内实体的变更追踪
 */
public interface EntityChangeTracker {

    // ============= 抽象方法：实现类需提供存储 =============
    Map<Class<?>, ChangeSet<?>> getChangesMap();

    // ============= 默认方法：追踪操作 =============
    default <T extends BaseEntity> void trackAdd(T entity) {
        getOrCreateChangeSet(entity.getClass()).getAdded().add(entity);
    }

    default <T extends BaseEntity> void trackRemove(T entity) {
        getOrCreateChangeSet(entity.getClass()).getRemoved().add(entity);
    }

    default <T extends BaseEntity> void trackModify(T entity) {
        getOrCreateChangeSet(entity.getClass()).getModified().add(entity);
    }

    // [新增] 特殊处理追踪
    default <T extends BaseEntity> void trackSpecial(T entity) {
        getOrCreateChangeSet(entity.getClass()).getSpecial().add(entity);
    }

    // ============= 私有辅助方法（Java 9+）=============
    @SuppressWarnings("unchecked")
    private <T> ChangeSet<T> getOrCreateChangeSet(Class<?> clazz) {
        return (ChangeSet<T>) getChangesMap().computeIfAbsent(clazz, k -> new ChangeSet<>());
    }

    // ============= 默认方法：查询变更 =============
    @SuppressWarnings("unchecked")
    default <T extends BaseEntity> ChangeSet<T> getChanges(Class<T> entityClass) {
        ChangeSet<?> changeSet = getChangesMap().get(entityClass);
        return changeSet != null ? (ChangeSet<T>) changeSet : ChangeSet.empty();
    }

    default boolean hasChanges() {
        return getChangesMap().values().stream().anyMatch(cs -> !cs.isEmpty());
    }

    default void clearChanges() {
        getChangesMap().clear();
    }

    default <T extends BaseEntity> void clearChanges(Class<T> entityClass) {
        getChangesMap().remove(entityClass);
    }

    @Getter
    class ChangeSet<T> {
        private final Set<T> added = new HashSet<>();
        private final Set<T> removed = new HashSet<>();
        private final Set<T> modified = new HashSet<>();
        private final Set<T> special = new HashSet<>();

        private static final ChangeSet<?> EMPTY = new ChangeSet<>() {
            @Override
            public Set<Object> getAdded() {
                return Collections.emptySet();
            }
            @Override
            public Set<Object> getRemoved() {
                return Collections.emptySet();
            }
            @Override
            public Set<Object> getModified() {
                return Collections.emptySet();
            }
            @Override
            public Set<Object> getSpecial() {
                return Collections.emptySet();
            }
        };

        @SuppressWarnings("unchecked")
        public static <T> ChangeSet<T> empty() {
            return (ChangeSet<T>) EMPTY;
        }

        public boolean isEmpty() {
            return added.isEmpty() && removed.isEmpty() && modified.isEmpty() && special.isEmpty();
        }

        public ChangeSet<T> merge(ChangeSet<T> other) {
            this.added.addAll(other.getAdded());
            this.removed.addAll(other.getRemoved());
            this.modified.addAll(other.getModified());
            this.special.addAll(other.getSpecial());
            return this;
        }

        public static <T> Collector<ChangeSet<T>, ChangeSet<T>, ChangeSet<T>> toMergedChangeSet() {
            return Collector.of(ChangeSet::new, ChangeSet::merge,
                    (cs1, cs2) -> {
                        cs1.merge(cs2);
                        return cs1;
                    }
            );
        }
    }
}
```

- 聚合根实现
```java
/**  
 * 商品聚合对象 BO  
 */
@Data  
@SuperBuilder  
@NoArgsConstructor  
@AllArgsConstructor  
public class PrdProductAggregateBO implements EntityChangeTracker {  
  
    private final Map<Class<?>, ChangeSet<?>> changesMap = new HashMap<>();  // 实体变更追踪  

    private Long id;                              // 主键ID  
    private String productCode;                   // 商品编码  
    private String productName;                   // 商品名称  
    private String specification;                 // 规格型号    
  
    /**  
     * 聚合内实体 - 商品分类  
     */  
    private List<PrdCategoryBO> prdCategoryList;  // 商品分类  
  
  
    // ==================== 业务方法 ====================
    public void addCategoryItem(PrdCategoryBO category) {  
        this.prdCategoryList.add(category);  
        trackAdd(category);  // 直接使用接口默认方法  
    }  
  
    public void removeCategoryItem(PrdCategoryBO category) {  
        this.prdCategoryList.remove(category);  
        trackRemove(category);  // 直接使用接口默认方法  
    }  
  
    public void modifyCategoryItem(PrdCategoryBO category) {  
        this.prdCategoryList.remove(category);  
        this.prdCategoryList.add(category);  
        trackModify(category);  // 直接使用接口默认方法  
    }  
  
}
```

- 在 repository 的使用
```java
@Transactional
public void save(Order order) {
	// 1. 保存聚合根
	orderMapper.insertOrUpdate(toOrderPO(order));
	
	// 2. 保存各类子实体的变更（直接调用接口方法）
	saveOrderItemChanges(order.getChanges(OrderItem.class));
	savePaymentItemChanges(order.getChanges(PaymentItem.class));
	savePurchaseItemChanges(order.getChanges(PurchaseItem.class));
	
	// 3. 清理变更记录
	order.clearChanges();
}
```



# 🧱 项目结构
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20250123210739.png)

## 📖 触发器层 trigger
<u>我们可以根据触发动作进行分类</u>：
- **接口调用**（HTTP / RPC）
	- HTTP 接口：通过 RESTful API ，外部系统可以直接调用领域服务。适合需要同步响应的场景
	- RPC 调用：通过 gRPC、Thrift 等远程过程调用框架，实现服务之间的高效通信。适合服务之间的高性能通信需求
- **消息监听** ：监听消息队列中的消息，触发相应的领域逻辑处理
- **定时任务** ：通过定时任务框架，定时触发某些领域逻辑

> [!hint] 如果这个应用程序只有接口调用，那可以把 `trigger` 换成 `interfaces`

## 📖 接口层 api
- 提供统一的外部接口 ：API 层负责将系统的内部功能通过一组清晰的接口暴露给外部（如前端、移动端、第三方系统等），而屏蔽内部实现细节，仅暴露出客户端需要的功能和数据，保证了系统的安全性和可维护性
- 让领域层专注于业务逻辑，而不用处理低层的通信协议问题
- 支持多种客户端的需求：系统可能需要支持多种客户端（如 Web 前端、移动端、第三方合作伙伴等），而不同的客户端可能通信协议，数据格式不同，API 层可以协调

## 📖 应用层 application
> [!note] application 层不能被引入，并且要直接或间接地引入所有模块

`application` **应用层** ：
- 在没有 trigger 层时：用来组合领域层之间的业务，形成完整的业务【比如有一个领域是知识星球领域，另一个领域是 ChatGPT 领域，我要进行两个领域的对接，就在应用层实现】
- 有 trigger 层时：则由 trigger 负责组合领域层之间的业务，application 层负责协调一些全局的配置，配置 resource 资源目录，以及编写测试用例

## 📖 领域层 domain
> [!note] domain 层不能引入任何模块

- `domain` **领域层** ==Service==
	- `model` **领域模型**，定义了领域对象、聚合和值对象
		- `bo` 业务对象
		- `vo` 值对象
		- ……
	- `repository` 仓库，里面定义了仓库接口，访问 Infrastructure 层的 repository 实现类
	- `service` **领域服务**，包含业务逻辑，只关注业务功能实现，不与外部任何接口和服务直连，而是通过<u>仓储 Repository</u>，<u>端口 Port</u>，或者<u>适配器 Adapter</u> 实现调用

---

> [!hint] Model
> ![500](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/20250204110739.png)
> 
> - `POJO`【~~plain old java object~~】普通 Java 对象，可以作为其他数据模型的基础
> 	- `VO`【~~value object~~】 ：值对象是不可变的对象，<u>没有唯一 ID 标识符</u>，用于表示一组值【~~意味着如果两个值对象的属性相同，那么它们就是相等的~~】
> 		- 通常不会提供 setter 方法，而是提供构造函数或者 Builder 方法来实例化对象
> 		- VO 中通常重写 equals 和 hashCode 方法，以便基于值进行比较
> 	- `PO / 实体`【~~Entity~~】 ：实体<u>必须要有唯一 ID 标识符</u>，意味着如果两个 Entity 的属性值相同，它们也不相等；PO 是与数据库表相映射的 Java 对象【~~所以 PO 和实体可以看作是相同的概念~~】
> 	- `DTO`【~~data transfer object~~】：DTO 用于在不同层之间传输数据
> 		- 不包含任何业务逻辑
> 	- `充血模型` ：充血模型 = PO + 业务逻辑，~~如果某个 PO 中有业务逻辑，那它就是充血模型~~
> 		- `BO`【~~Business object~~】：业务对象，可以是多个 PO 的组合，并且包含业务逻辑

> [!hint] 在领域与领域之间，如果需要某个充血模型，要把 <u>充血模型</u> 使用工厂组装成 <u>贫血模型</u> 进行传输

## 📖 基础层 infrastructure
> [!note] infrastructure 与 domain 的关系
> infrastructure 与 domain 之间通过仓储 Repository 来解耦
> - `domain` 
> 	- 【repository】
> 		- IRaffleRepository 是一个**业务优先**的 Repository
> - `infrastructure` 
> 	- 【JPARepository】
> 		- IStrategyRepository 这个是**实体优先**的 Repository
> 	- 【repository】
> 		- RaffleRepository：RaffleRepository 实现了 IRaffleRepository 接口；然后再调用多个实体优先的 Repository 来整合形成自己的业务

- `infrastructure` **基础层**，包含了数据库，缓存，网关，第三方工具…… ==Mapper==
	- `Mapper` 
	- `PO` 
	- `redis` 
	- `repository` 使用 `@Repository` 标记

🏷️repository 的方法要尽可能的少，要可以复用，比如新增，修改可以写成一个方法批量持久化 saveList

🏷️repository 的方法要事务一致性，比如有主订单，子订单，那 repository 是不会提供单独持久化子订单的方法的，要修改子订单就必须通过主订单的方法

## 📖 类型层 types
types 层用来定义一系列自定义的，用于所有层的公共对象（~~异常类，全局参数类，全局配置类 ……~~）

# 🧩 扩展
> [!hint] 除非你的系统过于复杂，无法作为单体进行管理，否则不要考虑微服务

- **单体架构优先**：单体架构能用，不要用微服务
- **项目不要一开始就构建微服务**：所有成功的微服务案例，都是从单体架构演变的（因为你只有做好了单体架构，你才熟悉业务流程，知道哪块臃肿了，要拆出去，如果一上来就微服务，拆错了，后期就难改了）


[教程](https://zq99299.github.io/note-book2/ddd/01/02.html)

















