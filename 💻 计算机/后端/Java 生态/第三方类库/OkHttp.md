$$
OkHttp 是一个高效的 HTTP 客户端，支持同步阻塞，异步回调
$$

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>5.0.0-alpha.12</version>
</dependency>
```

> [!quote] 同步请求，异步请求
> - **同步请求**：发送一个同步请求时，发送方会停下来等待服务器的响应，在此期间，用户无法进行其他操作，整个程序会被阻塞，直到服务器返回响应
> - **异步请求**：发送一个异步请求时，发送方不会等待服务器的响应，而是立即继续执行后面的代码，当服务器返回响应时，会触发一个回调函数，用来处理响应数据

# 同步
## Get 获取响应
- 创建 OKHttp 实例，用于发送请求 `OkHttpClient client = new OkHttpClient(); `
- 构建 **Request 对象** `Request request = new Request.Builder() `
	- `url()` 访问的 url
	- `header(name, value)` 添加请求头，会覆盖已有 name 的 value 值
	- `addHeader(name, value)` 添加请求头，不会移除已有的头信息
	- `build()` 完成构建
- 发起同步请求，并获取到 **Response 结果** `Response response = client.newCall(request).execute()` **在请求的过程中出现错误，就会进入到 catch 代码块里**
	- `isSuccessful()` 判断请求是否成功【200 - 299】
	- `close()` 关闭资源，如果使用了 try resource 结构那就可以不用
	- `header(name)` 返回 name 的最后一个 value，response.header("Server")
	- `headers(name)` 以列表形式读取某个 name 的所有 value
	- `headers()` 获取 Response 对象的头部信息
		- `size()` 头部信息的个数
		- `name(索引)` 头部信息的名称
		- `value(索引)` 头部信息的值
	- `body()` 响应体
		- `string()` 解析消费响应体的内容，一个 Response 只能使用一次

```java
// 创建 OkHttpClient 实例
private final OkHttpClient client = new OkHttpClient();  
  
@Test  
public void QueryUnanswered() throws IOException {  
	// 创建 Request 对象并添加请求头
    Request request = new Request.Builder()  
		    .url("https://api.zsxq.com/v2/groups/15555541222422/topics?scope=all&count=20")  
            .addHeader("cookie", "……")  
            .addHeader("Content-type", "application/json; charset=UTF-8")  
            .build();  

	// 发起请求并处理响应
    try (Response response = client.newCall(request).execute()) {  
	    // 如果响应不成功，则抛出异常
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);  

		// 获取到响应对象的响应头
        Headers responseHeaders = response.headers();  
        for (int i = 0; i < responseHeaders.size(); i++) {  
            System.out.println(responseHeaders.name(i) + ": " + responseHeaders.value(i));  
        }  
  
        System.out.println(response.body().string());  
    }
}
```

> [!hint]
> - 当响应体的内容 < 1MB，使用 `string()`
> - 当响应体的内容 > 1MB，使用 `stream`

## Post 小内容
- ……
- `Request`
	- `post(请求的媒体类型, 内容)` 

```java
// 表示请求的媒体类型为 Markdown 格式
public static final MediaType MEDIA_TYPE_MARKDOWN = MediaType.parse("text/x-markdown; charset=utf-8");
    
private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
	// 这里最好使用json库来一个一个put，然后最后将json对象转为String
    String postBody = "" +
        "Releases\n" +
        "--------\n" +
        "\n" +
        " * _1.0_ May 6, 2013\n" +
        " * _1.1_ June 15, 2013\n" +
        " * _1.2_ August 11, 2013\n";

	// 使用 RequestBody.create 方法创建请求体，指定了请求的媒体类型和内容
    Request request = new Request.Builder()
        .url("https://api.github.com/markdown/raw")
        .post(RequestBody.create(postBody, MediaType.parse("application/json")))
        .build();
        
    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
        System.out.println(response.body().string());
    }
}
```

## Post 大内容
```java
public static final MediaType MEDIA_TYPE_MARKDOWN = MediaType.parse("text/x-markdown; charset=utf-8");

private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
    RequestBody requestBody = new RequestBody() {
	    // 定义请求体的媒体类型
        @Override
        public MediaType contentType() {
            return MEDIA_TYPE_MARKDOWN;
        }

		// 内容写入
        @Override
        public void writeTo(BufferedSink bufferedSink) throws IOException {
            bufferedSink.writeUtf8("Numbers\n");
            bufferedSink.writeUtf8("-------\n");
            for (int i = 2; i <= 997; i++) {
                bufferedSink.writeUtf8(String.format(" * %s = %s\n", i, factor(i)));
            }
        }

		// 创建 factor() 函数，用于上面内容写入
        private String factor(int n) {
            for (int i = 2; i < n; i++) {
                int x = n / i;
                if (x * i == n) return factor(x) + " × " + i;
            }
            return Integer.toString(n);
        }
    };
    
    Request request = new Request.Builder()
        .url("https://api.github.com/markdown/raw")
        .post(requestBody)
        .build();
        
    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
        System.out.println(response.body().string());
    }
}
```

## Post 发布文件
```java
public static final MediaType MEDIA_TYPE_MARKDOWN = MediaType.parse("text/x-markdown; charset=utf-8");

private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
    File file = new File("README.md");
    
    Request request = new Request.Builder()
        .url("https://api.github.com/markdown/raw")
        .post(RequestBody.create(MEDIA_TYPE_MARKDOWN, file))
        .build();
        
    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
        System.out.println(response.body().string());
    }
}

```

## Post 表单参数
使用 `FormBody.Builder()` 生成请求体

```java
private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
	// search 参数，Jurassic Park 值
    RequestBody formBody = new FormBody.Builder()
        .add("search", "Jurassic Park")
        .build();
        
    Request request = new Request.Builder()
        .url("https://en.wikipedia.org/w/index.php")
        .post(formBody)
        .build();
        
    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
        System.out.println(response.body().string());
    }
}
```

## Post 复杂数据
我们可以使用 `MultipartBody.Builder` 【~~箱子~~】，里面放各种的请求体【~~东西~~】【文件，文本……】，每个请求体都可以定义自己的<u>头信息</u>【~~每样东西都有自己的标签~~】

```java
private static final String IMGUR_CLIENT_ID = "...";
private static final MediaType MEDIA_TYPE_PNG = MediaType.parse("image/png");

private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
    RequestBody requestBody = new MultipartBody.Builder()
        .setType(MultipartBody.FORM)
        .addFormDataPart("title", "Square Logo")
        .addFormDataPart("image", "logo-square.png"
            , RequestBody.create(MEDIA_TYPE_PNG, new File("website/static/logo-square.png")))
        .build();

    Request request = new Request.Builder()
        .header("Authorization", "Client-ID " + IMGUR_CLIENT_ID)
        .url("https://api.imgur.com/3/image")
        .post(requestBody)
        .build();

    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
        System.out.println(response.body().string());
    }
}
```

# 异步
## 概述
- 发起异步请求 `client.newCall(request).enqueue(new Callback() {……});`
- 在 `{……}` 中添加回调函数
	- 失败时被调用 `onFailure(Call, IOException) {……}`
	- 接收到响应时被调用 `onResponse(Call, Response) {……}`

## get，获取响应
```java
private final OkHttpClient client = new OkHttpClient();

public void run() throws Exception {
    Request request = new Request.Builder()
        .url("http://publicobject.com/helloworld.txt")
        .build();

    // 将请求放入队列中，并设置一个回调函数来处理响应结果
    client.newCall(request)
        .enqueue(new Callback() {
            // 定义了回调函数中的 onFailure 方法，请求失败时被调用，Call 对象表示当前请求
            @Override public void onFailure(Call call, IOException e) {
                e.printStackTrace();
            }

            // 定义了回调函数中的 onResponse 方法，在接收到响应时被调用
            @Override public void onResponse(Call call, Response response) throws IOException {
                try (ResponseBody responseBody = response.body()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
                    Headers responseHeaders = response.headers();
                    for (int i = 0, size = responseHeaders.size(); i < size; i++) {
                        System.out.println(responseHeaders.name(i) + ": " + responseHeaders.value(i));
                    }
                    System.out.println(responseBody.string());
                }
            }
        });
}
```

# 杂
## 使用 moshi 解析 JSON 响应
使用 OkHttp 和 Moshi 库，将 JSON 响应反序列化为 Java 对象

```java
private final OkHttpClient client = new OkHttpClient();
// 创建了一个 Moshi 实例来处理 JSON序列化 和 反序列化
private final Moshi moshi = new Moshi.Builder().build();
// 从`Moshi`实例中获取了一个`Gist`类的`JsonAdapter`。这个适配器将用于将JSON转换成`Gist`对象
private final JsonAdapter < Gist > gistJsonAdapter = moshi.adapter(Gist.class);

public void run() throws Exception {
    Request request = new Request.Builder()
        .url("https://api.github.com/gists/c2a7c39532239ff261be")
        .build();
        
    try (Response response = client.newCall(request).execute()) {
        if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

		// 使用`JsonAdapter`，将响应体从JSON转换为`Gist`对象
        Gist gist = gistJsonAdapter.fromJson(response.body().source());

		// 遍历`Gist`对象中的文件，并打印文件名和文件内容
        for (Map.Entry < String, GistFile > entry: gist.files.entrySet()) {
            System.out.println(entry.getKey());
            System.out.println(entry.getValue().content);
        }
    }
}

// 包含了文件名到`GistFile`实例的映射
static class Gist {
    Map < String, GistFile > files;
}

// 代表Gist中的一个文件，里面有文件内容
static class GistFile {
    String content;
}
```

# 发送 WebSocket 请求

> [!quote] 什么是 WebSocket ？
> WebSocket 是一种<u>低延迟</u>，<u>全双工</u> ~~【通信的双方可以同时发送和接收数据，不需要等待对方的响应或传输完成】~~，<u>持久的</u>连接协议
> 
> <u>缺点</u> ：
> - 不提供安全加密，需要自己实现
> - 对服务器要求高【因为要一直维持连接状态】
> 
> <u>优点</u> ：
> - 持久地传输数据
> 	- 传统的 HTTP 协议服务端在明处，客户端在暗处，服务端想给客户端传数据时，会找不到客户端，只有在客户端请求服务端时才行
> 	- WebSocket 协议可以建立持久的连接，通信双方随时通信
> - 实时传输：WebSocket 一旦建立连接就会保持，所以延迟更低，不会频繁的发起连接请求

> [!hint] 心跳机制
> 
> > 心跳机制 是维持持久连接的前提，WebSocket 会定时发送一个特殊的数据包来保持连接，防止长时间无数据传输导致连接中断
> 
> 如果一段时间没有收到对方发送的心跳包，就可以认为连接已经中断