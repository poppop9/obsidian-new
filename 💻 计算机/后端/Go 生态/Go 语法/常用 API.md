# time
<u>获取时间点</u> ：
- `Now()` 精确到纳秒

<u>获取时间差</u>
- `Since(Time)` 返回 Duration，精确到纳秒

<u>格式化</u> ：


<u>其他</u> ：
- `Sleep(Duration)` 用于让当前 goroutine 阻塞一段指定的时间


```go
start := time.Now()
cost := time.Since(start)

time.Sleep(100 * time.Millisecond) // 模拟一些耗时操作
```