
> [!quote] 序列化 Serialization
> 
> > 序列化 指的是将 Java Bean 转换为字节流的过程
> 
> - 目的 ：序列化后的字节流可以保存到文件中，或通过网络传输，使得接收方可以还原出原始的对象
> - 序列化需要一个 serialVersionUID ：serialVersionUID 是一个唯一标识符，用于确保在序列化和反序列化时，类的版本一致性。如果反序列化时，`serialVersionUID` 不匹配，会抛出 `InvalidClassException` 异常
> 	- 当 Java 类发生变化（~~添加字段、修改字段类型 ……~~），将自动生成一个 `serialVersionUID`

```java
import java.io.Serializable;

@Data  
@NoArgsConstructor  
@AllArgsConstructor
public class WeightRandom<T> implements Serializable {
	@Serial
    private static final long serialVersionUID = -8244697995702786499L;

    private int weight;
    private T value;
}
```









