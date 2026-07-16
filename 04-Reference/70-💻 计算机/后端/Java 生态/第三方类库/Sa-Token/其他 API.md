## SaHolder 获取上下文环境
- `SaRequest getRequest()` 获取 Request 对象
	- `getParam(参数名称)` 获取请求对象的指定 param 参数值
- `SaApplication getApplication()` 获取全局 SaApplication 对象

```java
SaHolder.getContext();           // 获取当前请求的 SaTokenContext
SaHolder.getResponse();          // 获取当前请求的 [Response] 对象 
SaHolder.getStorage();           // 获取当前请求的 [Storage] 对象
SaHolder.getApplication();       // 获取全局 SaApplication 对象
```


