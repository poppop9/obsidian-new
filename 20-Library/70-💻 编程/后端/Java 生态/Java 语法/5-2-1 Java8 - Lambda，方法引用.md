
# Lambda 表达式

> [!quote] Lambda 表达式
> `() -> {……}`
> ```
> ()：小括号里面没有内容，表示该方法没有参数。如果有多个参数，用逗号隔开
> ->：表示指向要做的事情
> {}：大括号里的内容表示需要做的事情（方法体内容）
> ```
> 
> <u>作用</u> ：
> - 简化代码
> - 简化字节码文件
> 	- 使用匿名内部类时，会在编译之后，单独产生一个字节码文件
> 	- 使用 Lambda 表达式时，编译之后不会单独产生一个字节码文件，而是在运行时动态生成

> [!warning] lambda 表达式中使用外部变量时，使用的是变量的副本，而不是对外部变量的直接引用
> - 为了确保在 Stream 流中<u>修改外部变量</u>~~【非原子操作】~~造成线程安全问题，这样的话，每个线程就会有一个副本

### 3. **作用域与闭包安全**

在 Java 中，lambda 表达式捕获的是**外部变量的值**，而不是变量的引用。这是为了避免闭包中变量状态的不一致问题。

假设 lambda 表达式能够直接引用外部变量，那么以下代码会引发问题：

java

复制

```
List<Runnable> tasks = new ArrayList<>();
for (int i = 0; i < 5; i++) {
    tasks.add(() -> System.out.println(i));
}
tasks.forEach(Runnable::run);
```

如果允许直接引用变量 `i`，那么所有的任务都会打印出相同的值（循环结束时 `i` 的最终值）。而通过捕获变量的副本，Java 确保了每个 lambda 表达式捕获的是 `i` 的当前值，而不是循环结束后的值。

### 4. **简化垃圾回收**

如果 lambda 表达式直接引用外部变量，那么这些变量可能会被 lambda 表达式持有，导致这些变量无法被垃圾回收器及时回收，进而引发内存泄漏的问题。通过捕获变量的值（而非引用），lambda 表达式对外部变量的生命周期没有影响，这有助于简化垃圾回收。

### 5. **Java 的设计哲学**

Java 一直以来都强调清晰性和安全性，而非最大化灵活性。在设计 `Stream` 和 lambda 表达式时，Java 的设计者选择限制外部变量的修改能力，以换取更高的代码可读性和安全性。

如果确实需要在 `Stream` 中累积结果，Java 提供了其他机制，比如使用 `reduce` 或 `collect` 方法。这些方法明确地表达了累积操作的意图，而不是通过隐藏的副作用来实现。

例如：

java

复制

```
int sum = numbers.stream().reduce(0, Integer::sum);
```

或者：

java

复制

```
int sum = numbers.stream().collect(Collectors.summingInt(Integer::intValue));
```

这种方式不仅清晰，而且与函数式编程的理念一致。

---

### 总结

Java 的 `Stream` 和 lambda 表达式设计时没有允许直接修改外部变量引用，是为了：

1. 避免并发问题，确保 `Stream` 能安全地在并行环境中运行。
2. 遵循函数式编程原则，减少副作用，提高代码的可预测性。
3. 确保闭包的安全性，避免循环变量等问题。
4. 简化垃圾回收，减少潜在的内存泄漏。
5. 符合 Java 一贯的清晰性和安全性设计哲学。

通过这种设计，Java 提供了更安全、更可维护的流式编程模型，同时保留了函数式编程的核心优势。

---

> [!hint] 使用前提
> - **这个类要有一个接口**：比如需要的 MyRunnable 这个类要有一个 Runnable 接口
> - **这个接口中有且仅有一个抽象方法**：比如 Runnable 接口里只有一个抽象方法 run

```java
public interface Eatable {  
    int add(int a, int b);    //一个接口且有且仅有一个抽象方法
}
```

```java
public class EatableDemo {  
    public static void main(String[] args) {  
        useEatable((int a, int b) -> {   // 书写Eatable的实现内部类
            return a + b;   //方法的具体实现
        });  
    }  
  
    public static void useEatable(Eatable e) {  //通过接口的实现类对象调用add方法  
        int sum = e.add(1, 2);  
        System.out.println(sum);  
    }  
}

---
3
```

> [!hint] 如何继续简写 Lambda 表达式
> - 小括号里的参数类型可以省略
> - 如果参数只有一个，那么小括号可以省略
> - 如果大括号里的语句只有一条，那么可以省略大括号和分号和 return
> 
> ```java
> useEatable((int a, int b) -> {   
> 	return a + b;                 
> });   
> 
> // 改写为
> useEatable((a, b) -> a + b);                           
> ```

# 方法引用

> [!quote] 方法引用
> 方法引用 `::` 简化了 Lambda 的书写

> [!hint]+ 引用类的静态方法
> ```java
> public interface parseInt {  
>     int convert(String s);  
> }
> 
> public class Demo {  
>     psvm {  
> 	    //Integer这个接口里面有个静态的parseInt方法
>         useParseInt(Integer::parseInt);  
>     }  
>   
>     public static void useParseInt(parseInt p) {  
>         System.out.println(p.convert("123"));  
>     }  
> }
> ```

> [!hint]+ 引用对象的实例方法
> ```java
> public interface Printable {  
>     void printString(String s);  
> }
> ```
> 
> ```java
> public class Demo {  
>     public static void main(String[] args) {  
>         //usePrintable(s -> System.out.println(s));  
>         usePrintable(System.out::println);        //自动把参数String s传递给println方法  
>     }                                             //out是PrintStream的实例对象，里面有println方法
>   
>     public static void usePrintable(Printable p) {  
>         p.printString("Hello Java");  
>     }
> }
> 
> 
> Hello Java
> ```

> [!hint]+ 引用类的实例方法
> ```java
> public interface SubString {  
>     String sub(String s, int x, int y);  
> }
> ```
> 
> ```java
> public class Demo {  
>     public static void main(String[] args) {  
>         useSubString(String::substring);  
>     }  
>   
>     public static void useSubString(SubString p) {  
>         System.out.println(p.sub("Hello Java", 2, 5));  
>     }  
> }
> ```

> [!hint]+ 引用构造方法
> ```java
> public class student {  
>     private int age;  
>     private String name;  
>   
>     public student(int age, String name) {  
>         this.age = age;  
>         this.name = name;  
>     }  
>   
>     public int getAge() {return age;}  
>     public void setAge(int age) {this.age = age;}  
>   
>     public String getName() {return name;}  
>     public void setName(String name) {this.name = name;}  
> }
> ```
> 
> ```java
> public interface studentBuilder {  
>     student build(int age, String name);  
> }
> ```
> 
> ```java
> public class Demo3 {  
>     public static void main(String[] args) {  
> 	    // 匿名内部类
> 		// useStudentBuilder(new studentBuilder() {  
> 		//     @Override  
> 		//     public student build(int age, String name) {         
> 		//         return new student(age, name);  
> 		//     }  
> 		// });  
> 	
> 		// Lambda表达式
> 		// useStudentBuilder((int age, String name) -> {           
> 		//     return new student(age, name);  
> 		// });  
>   
>         useStudentBuilder(student::new);     // new代表了构造方法
>     }  
>   
>     public static void useStudentBuilder(studentBuilder sb) {  
>         student s = sb.build(12, "吴彦祖");  
>         System.out.println(s.getAge() + "," + s.getName());  
>     }  
> }
> ```