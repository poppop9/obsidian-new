# 网络
- 如何 ping 端口，打开 powerShell，输入 `Test-NetConnection 192.168.1.13 -Port 3883` ，TcpTestSucceeded 属性标识了端口的访问情况
```bash
PS C:\Users\admin> Test-NetConnection 192.168.1.13 -Port 3883                                                           警告: TCP connect to (192.168.1.13 : 3883) failed                                                                                                                                                                                               
ComputerName           : 192.168.1.13
RemoteAddress          : 192.168.1.13
RemotePort             : 3883
InterfaceAlias         : 以太网
SourceAddress          : 192.168.1.10
PingSucceeded          : True
PingReplyDetails (RTT) : 0 ms
TcpTestSucceeded       : False
```

- 重启 WinNAT（Windows NAT Driver / 服务）
```bash
net stop winnat
net start winnat
```

# 进程
- 查看并杀死进程
```bash
# 查看是否被占用
Get-NetTCPConnection -LocalPort 8085 -ErrorAction SilentlyContinue
Get-NetUDPEndpoint -LocalPort 8085 -ErrorAction SilentlyContinue

# 查看是哪个进程占用
Get-Process -Id (Get-NetTCPConnection -LocalPort 8085).OwningProcess

# 杀死进程
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8085).OwningProcess -Force
```
