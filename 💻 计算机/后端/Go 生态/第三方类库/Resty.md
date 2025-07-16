```go
package main

import (
    "fmt"
    "github.com/go-resty/resty/v2"
)

func main() {
    client := resty.New()

    // 发起 POST 请求
    resp, err := client.R().
        SetHeader("Authorization", "Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****").
        SetHeader("Content-Type", "application/json").
        SetBody(`{
            "bot_id": "73428668*****",
            "user_id": "123123***",
            "stream": false,
            "auto": true
        }`).
        Post("https://api.coze.cn/v3/chat")

    if err != nil {
        fmt.Println("Error sending request:", err)
        return
    }

    // 输出响应
    fmt.Println("Response:", resp.String())
}
```
