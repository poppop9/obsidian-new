```bash
go get github.com/gin-gonic/gin@v1.10.1
```

Gin 是一个高性能的 web 框架
- Crash 处理 ：Gin 可以 catch 一个发生在 HTTP 请求中的 panic 并 recover 它。这样，你的服务器将始终可用。例如，你可以向 Sentry 报告这个 panic！
- 路由组 ：更好地组织路由。是否需要授权，不同的 API 版本……

# 路由
## json 数据
```
func main() {
	// 创建一个包含日志记录和恢复中间件的默认引擎实例。你可以用它来处理请求、路由、日志 ……
	engine := gin.Default()

	engine.GET("/student", func(c *gin.Context) {
		// context 是一个请求和相应的上下文对象
		c.JSON(http.StatusOK, gin.H{
			"message": "查询学生信息成功",
		})
	})
	engine.POST("/create_student", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "创建学生信息成功",
		})
	})
	engine.PUT("/updata_student", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "更新学生信息成功",
		})
	})
	engine.DELETE("/delete_student", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "删除学生信息成功",
		})
	})
	engine.Any("/studentAny", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "接收 /studentAny 的所有方法的请求",
		})
	})

    // 未找到路径的处理
    engine.NoRoute(func(context *gin.Context) {
		context.HTML(http.StatusNotFound, "404.html", gin.H{})
	})

	// 在指定端口启动 Web 服务器
	engine.Run(":6789")
}
```

## HTML 渲染
```
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	engine := gin.Default()

	engine.LoadHTMLGlob("templates/*")  // 加载指定路径下的所有 HTML 模板文件，并将它们加载到 Gin 引擎中，准备在后续的路由中使用
	engine.GET("/demo", func(context *gin.Context) {
		context.HTML(http.StatusOK, "index.html", gin.H{
			"name": "admin",
			"pwd":  "123456",
		})
	})

	engine.Run(":6789")
}
```

## 参数获取
```
id := context.Query("id")                // 获取 query 数据
username := context.PostForm("username") // 获取 form 数据
pwd := context.Param("pwd")              // 获取 path 数据
```

