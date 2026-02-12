```xml
<dependency>  
    <groupId>com.vladsch.flexmark</groupId>  
    <artifactId>flexmark-all</artifactId>  
    <version>0.64.8</version>  
</dependency>
```

Flexmark 可以：
- html <<<--->>> md
- md --->>> PDF
- md --->>> DOCX

# md -> html
```java
Document document = Parser.builder().build().parse("md字符串");  
String html = HtmlRenderer.builder().build().render(document);  
System.out.println(html);
```



