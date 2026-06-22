```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

# 示例
<u>配置 yml</u> ：
```yml
# qq邮箱
spring:
  mail:
    host: smtp.qq.com  # 邮箱的SMTP服务器
    port: 587    # SMTP端口，587用于TLS
    username: 1962@qq.com    # QQ邮箱地址
    password: mua    # QQ邮箱的授权码
    properties:
      mail.debug: true
      mail.smtp.auth: true   # 启用SMTP身份验证
      mail.smtp.starttls.enable: true    # 启用TLS
      mail.smtp.starttls.required: true  # 强制使用TLS
```

<u>服务类</u> ：
```java
@Value("${spring.mail.username}")
private String from;

@Resource
private JavaMailSender emailSender;

public void sendMail(String to, String subject, String text) {
	SimpleMailMessage message = new SimpleMailMessage();
	message.setFrom(from);
	message.setTo(to);
	message.setSubject(subject);
	message.setText(text);

	emailSender.send(message);
}
```

# 发送邮件类
- `JavaMailSender` 发送邮件类

# 邮件信息类
## 简单文字 SimpleMailMessage
`SimpleMailMessage` 简单的邮件信息

<u>构造方法</u> ：
- `new SimpleMailMessage` 

<u>非静态方法</u> ：
- `setFrom()` 发件人
- `setTo()` 收件人
- `setSubject()` 邮件标题
- `setText()` 正文内容

## HTML 数据
```java
@Resource
private JavaMailSender emailSender;

/**
 * 发送邮件
 */
public void sendEmail(String subject) throws Exception {
	MimeMessage message = emailSender.createMimeMessage();
	MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "UTF-8");

	// 设置发送信息
	messageHelper.setFrom(from);
	messageHelper.setTo("……");
	messageHelper.setSubject(subject);
	messageHelper.setText("html 字符串", true);

	emailSender.send(message);
}
```


## 复杂数据 MimeMessage
- `MimeMessage` 富内容邮件信息，~~图片，HTML，附件~~

```java
@Value("${spring.mail.username}")  
private String from;  
  
@Resource  
private JavaMailSender emailSender;

public void sendMimeMail(String to, String subject, String text) throws MessagingException, IOException {
	MimeMessage message = emailSender.createMimeMessage();
	MimeMessageHelper messageHelper = new MimeMessageHelper(message, true,"UTF-8");

	// 设置发送信息
	messageHelper.setFrom(from);
	messageHelper.setTo(to);
	messageHelper.setSubject(subject);

	// mixed 表示消息包含多个不同的部分
	MimeMultipart multipart = new MimeMultipart("mixed");

	// 正文 + 图片
	MimeBodyPart bodyPart = new MimeBodyPart();
	bodyPart.setContent("<h3>" + text + "</h3><br/><img src='https://img1.baidu.com/it/u=795126532,212526253&fm=253&fmt=auto&app=120&f=JPEG?w=608&h=456'>", "text/html; charset=utf-8");
	multipart.addBodyPart(bodyPart);

	// 附件
	MimeBodyPart attachmentBodyPart = new MimeBodyPart();
	attachmentBodyPart.attachFile("C:\\Users\\19628\\Downloads\\英国地址库导入模板.xlsx");
	multipart.addBodyPart(attachmentBodyPart);

	message.setContent(multipart);

	emailSender.send(message);
}
```