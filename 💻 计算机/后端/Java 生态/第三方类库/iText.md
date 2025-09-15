```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>kernel</artifactId>
    <version>9.2.0</version>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>layout</artifactId>
    <version>9.2.0</version>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>bouncy-castle-adapter</artifactId>
    <version>9.2.0</version>
</dependency>
```

[https://www.cnblogs.com/antLaddie/p/18263471](https://www.cnblogs.com/antLaddie/p/18263471)


# ❤️ 创建 PDF
- PDF 文件是通过 PdfWriter 写入的
- PdfDocument 是操作 PDF 内容的工具
- Document 是 PdfDocument 的封装，提供了更多的 API

```java
@RequestMapping("/test1")
public void test1(HttpServletResponse response) throws IOException {
    response.setContentType("application/pdf");
    response.setHeader("Content-Disposition", "inline; filename=example.pdf");

    try (PdfWriter writer = new PdfWriter(response.getOutputStream());
         PdfDocument pdfDoc = new PdfDocument(writer);
         Document document = new Document(pdfDoc)) {
        document.add(new Paragraph("Hello, iText 9 from Spring Boot!"));  // 向 PDF 添加段落
        document.add(new Image(ImageDataFactory.create(imagePath)));  // 添加本地图片
    }
}
```


# ❤️ 美化 PDF



