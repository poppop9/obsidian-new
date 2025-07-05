
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

