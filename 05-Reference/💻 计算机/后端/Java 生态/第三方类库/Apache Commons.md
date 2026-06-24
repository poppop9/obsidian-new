
# Apache Commons Pool
```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
    <version>2.12.0</version>
</dependency>

implementation group: 'org.apache.commons', name: 'commons-pool2', version: '2.12.0'
```

## 对象池
```java
public static void main(String[] args) throws Exception {
	// 创建对象池
	ObjectPool<MyObject> pool = new GenericObjectPool<>(new MyObjectFactory());

	// 获取对象
	MyObject obj = pool.borrowObject();
	System.out.println("Borrowed object: " + obj);

	// 使用对象
	obj.doSomething();

	// 归还对象
	pool.returnObject(obj);
	System.out.println("Returned object");
}
```

```java
class MyObject {
    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

```java
class MyObjectFactory extends BasePooledObjectFactory<MyObject> {
    @Override
    public MyObject create() {
        return new MyObject();
    }

    @Override
    public void destroyObject(org.apache.commons.pool2.PooledObject<MyObject> p) {
        // 销毁对象时的操作
        System.out.println("Destroying object");
    }

    @Override
    public boolean validateObject(org.apache.commons.pool2.PooledObject<MyObject> p) {
        // 在对象归还池之前，验证对象是否有效
        return true;
    }
}
```

<u>在归还对象时，清除对象属性</u> ：
- 在 validateObject 中进行清理： validateObject 方法在对象归还池之前会被调用，用于检查对象的有效性。如果你希望对象归还时进行清理，可以在此方法中重置对象的状态
```java
@Override
public boolean validateObject(PooledObject<MyObject> p) {
    MyObject obj = p.getObject();
    obj.resetState();  // 假设你有一个 `resetState()` 方法来清理内部状态
    return true; // 返回 true 表示对象有效
}
```

