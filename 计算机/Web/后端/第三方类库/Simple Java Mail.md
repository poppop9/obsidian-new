```xml
<dependency>  
    <groupId>org.simplejavamail</groupId>  
    <artifactId>simple-java-mail</artifactId>  
    <version>8.12.2</version>  
</dependency>
```

---

1. 构建数据对象 Email，简单数据，HTML，文件 ……
2. 构建发送对象 Mailer，配置发送服务器参数
3. 发送邮件

# HTML 数据
```java
public void sendEmailBySJE() {
	Email email = EmailBuilder.startingBlank()
			.from("1962883041@qq.com")  // 发件人
			.to("1962883041@qq.com")  // 收件人
			.withSubject("Simple Java Mail - 测试")  // 主题
			.withHTMLText("<h1>Hello World!</h1>"
					+ "<img src='https://img1.baidu.com/it/u=795126532,212526253&fm=253&fmt=auto&app=120&f=JPEG?w=608&h=456'>"
			)  // html内容
			.buildEmail();

	Mailer mailer = MailerBuilder.withSMTPServer("smtp.qq.com", 587, "1962883041@qq.com", "musddqdnsraybcge")
			.buildMailer();

	mailer.sendMail(email);
}
```

# 复杂数据
```java
public void sendComplexEmailBySJE() throws IOException {
	InputStream inputStream = new URL("https://img1.baidu.com/it/u=795126532,212526253&fm=253&fmt=auto&app=120&f=JPEG?w=608&h=456").openStream();

	Email email = EmailBuilder.startingBlank()
			.from("1962883041@qq.com")  // 发件人
			.to("1962883041@qq.com")  // 收件人
			.withSubject("Simple Java Mail - 测试")  // 主题
			// html内容
			.withHTMLText("<h1>Hello World!</h1>"
					+ "<img src='https://img1.baidu.com/it/u=795126532,212526253&fm=253&fmt=auto&app=120&f=JPEG?w=608&h=456'>"
			)
			// 文件
			.withAttachment(
					"英国地址信息2024-08-28.xls",
					Files.readAllBytes(Paths.get("C:\\Users\\19628\\Desktop\\地址库\\英国地址信息2024-08-28.xls")),
					"text/plain"
			)
			// 图片
			.withAttachment(
					"image.jpg",
					inputStream.readAllBytes(),
					"image/jpeg"
			)  
			.buildEmail();
	inputStream.close();

	Mailer mailer = MailerBuilder.withSMTPServer("smtp.qq.com", 587, "1962883041@qq.com", "musddqdnsraybcge")
			.buildMailer();

	mailer.sendMail(email);
}
```