
```XML
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-oauth2</artifactId>
    <version>1.39.0</version>
</dependency>
```

```java
@RestController
@RequestMapping("/api/oAuth2")
public class SaOAuth2ClientController {

    private final String clientId = "Ov23liFZWh3Zoi7yEGaB";  // 应用id
    private final String clientSecret = "8c9fc17e44bab279c91fd9549873771a00817262";  // 应用秘钥
    private String accessToken;

    @Autowired
    private OkHttpClient okHttpClient;

    /**
     * 1. 访问github授权地址，获取授权码
     * http://localhost:8088/api/oAuth2/getAuthorizationCode
     */
    @GetMapping("/getAuthorizationCode")
    public void getAuthorizationCode(HttpServletResponse response) throws IOException {
        // 重定向到github授权页
        response.sendRedirect("https://github.com/login/oauth/authorize?client_id=Ov23liFZWh3Zoi7yEGaB");
    }

    /**
     * 2. 定义回调地址，github会携带授权码请求该地址。然后使用授权码拿到Access-Token
     * http://localhost:8088/api/oAuth2/getAccessToken
     */
    @RequestMapping("/getAccessToken")
    public SaResult codeLogin(@RequestParam String code) throws IOException {
        Request request = new Request.Builder()
                .url("https://github.com/login/oauth/access_token")
                .header("Accept", "application/json")
                .post(RequestBody.create(
                        new ObjectMapper().createObjectNode()
                                .put("client_id", clientId)
                                .put("client_secret", clientSecret)
                                .put("code", code)
                                .toString(),
                        MediaType.parse("application/json; charset=utf-8")
                ))
                .build();

        // 发起请求并处理响应
        try (Response response = okHttpClient.newCall(request).execute()) {
            // 如果响应不成功，则抛出异常
            if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
            JsonNode jsonNode = new ObjectMapper().readValue(response.body().string(), JsonNode.class);
            accessToken = jsonNode.get("access_token").asText();

            return SaResult.data(jsonNode);
        }
    }

    /**
     * 3. 测试看能不能拿到github中的信息
     * http://localhost:8088/api/oAuth2/getUserInfo
     */
    @GetMapping("/getUserInfo")
    public SaResult getUserInfo() throws IOException {
        Request request = new Request.Builder()
                .url("https://api.github.com/user")
                .header("Authorization", "Bearer " + accessToken)
                .build();

        // 发起请求并处理响应
        try (Response response = okHttpClient.newCall(request).execute()) {
            // 如果响应不成功，则抛出异常
            if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);
            return SaResult.data(response.body().string());
        }
    }
}
```
