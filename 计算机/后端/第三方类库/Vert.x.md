```xml
<dependency>
    <groupId>io.vertx</groupId>
    <artifactId>vertx-core</artifactId>
    <version>4.5.11</version>
</dependency>

implementation group: 'io.vertx', name: 'vertx-core', version: '4.5.11'
```

```java
public void test() {
	Vertx vertx = Vertx.vertx();
	
	// 创建 HTTP 服务器
	HttpServer server = vertx.createHttpServer();
	
	server.requestHandler(req -> {
		// 设置 SSE 响应头
		HttpServerResponse response = req.response();
		response.putHeader("Content-Type", "text/event-stream")
				.putHeader("Cache-Control", "no-cache")
				.putHeader("Connection", "keep-alive");
		
		// 持续不断地发送 SSE 事件
		vertx.setPeriodic(1000, id -> {
			// 发送事件数据
			String data = "data: " + System.currentTimeMillis() + "\n\n";  // 示例数据
			response.write(data);
		});

		req.endHandler(v -> {
			System.out.println("Client disconnected");
			response.end();  // 客户端断开连接时关闭响应流
		});
	});

	// 启动服务器
	server.listen(8080, "localhost", res -> {
		if (res.succeeded()) {
			System.out.println("Server is now listening on http://localhost:8080");
		} else {
			System.out.println("Failed to start server: " + res.cause().getMessage());
		}
	});
}
```