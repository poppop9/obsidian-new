# 📚 软件
- `cleanmymac`
- `paste` 剪贴板
- `pixpin` 截屏工具
- `CleanShot X` 截图录屏
- `Parallels Desktop` 虚拟机
- `IINA` 播放器
- `keka` 解压缩工具
- `AlDente` 电池管理
- `coconutBattery` 测电池健康数据
- `pdfgear`
- 编程
	- `Homebrew` 包管理器
	- `navicat` 数据库连接工具
	- `offset explorer 3` kafka 客户端工具
	- `redis insight` redis 客户端工具
	- `xterminal` 终端工具
- `alcove` 灵动岛
- `motrix` 磁力下载
- `mountain duck` 磁盘挂载
- `permute` 媒体格式转换器
- `downie` 视频下载器
- `Logic Pro` 编曲软件
- `blip` 传输工具
- `超级右键` 可以右键创建文件 ……
- `cotEditer` 文本编辑软件
- `CrossOver` 可以运行 exe 文件

---

- Royal TSX Mac上最强大的远程管理软件
- memory bar 可以把重要的链接放到菜单栏
- Free-NTFS-for-Mac u 盘中，ntfs 格式是 win 用的，但是这个格式和 mac 不兼容，但是这个软件就可以解决这个问题
- ibar 显示隐藏的任务栏图标

## Claude
- `双击 option` 打开对话框

## PixPin
- `control + 1` 进入截图界面
- `control + 2` 钉住截图

## 欧陆词典
- `option + 空格` 进入翻译界面

# 📚 快捷键
## 通用操作
| 快捷键                | 功能              |
| ------------------ | --------------- |
| `⌘ + 空格`           | 聚焦搜索（Spotlight） |
| `⌘ + H`            | 隐藏当前窗口          |
| `⌘ + M`            | 最小化当前窗口         |
| `⌘ + Option + Esc` | 强制退出程序管理器       |
| `⌘ + Shift + 5`    | 截屏 / 录屏工具       |
| `⌘ + Q`            | 退出应用            |
| `Control + →`      | 切换桌面            |

## 文本编辑
| 快捷键                   | 功能            |
| --------------------- | ------------- |
| `⌘ + ←`         | 光标移到行首（Home）  |
| `⌘ + →`         | 光标移到行末（End）   |
| `⌘ + Shift + V` | 粘贴并匹配样式（不带格式） |
| `Fn + Backspace`      | 向后删除（Delete）  |


## Finder 访达
| 快捷键              | 功能             |
| ---------------- | -------------- |
| `⌘ + Shift + .`  | 显示 / 隐藏隐藏文件    |
| `⌘ + Backspace`  | 将文件移到废纸篓       |
| `⌘ + Option + V` | 移动已复制的文件（剪切粘贴） |
| `⌘ + o`          | 使用默认应用打开选中的文件  |
| `Enter`          | 重命名文件          |
| `空格`             | 快速预览文件         |
| `⌘ + Shift + G`  | 前往文件夹          |


## 输入法 & 触控板

| 操作            | 功能               |
| ------------- | ---------------- |
| 长按 `中/英` 键    | 切换大小写（Caps Lock） |
| 用力按压程序坞中的 App | 显示该 App 的所有窗口    |

## Chrome
| 快捷键                     | 功能       |
| ----------------------- | -------- |
| `Control + Tab`         | 向前切换标签页  |
| `Control + Shift + Tab` | 向后切换标签页  |
| `⌘ + T`           | 新建标签页    |
| `⌘ + W`           | 关闭当前标签页  |
| `⌘ + Shift + N`   | 新建无痕窗口   |
| `⌘ + R`           | 刷新页面     |
| `⌘ + Shift + R`   | 清除缓存强制刷新 |
| `⌘ + L`           | 光标跳转到地址栏 |
| `⌘ + F`           | 页面内查找    |
| `⌘ + +`           | 放大页面     |
| `⌘ + -`           | 缩小页面     |
| `⌘ + [`           | 后退       |
| `⌘ + ]`           | 前进       |
| `⌘ + Option + I`  | 打开开发者工具  |

# 📚 系统功能
🔴 触发角：系统设置 → 桌面与程序坞 → 触发角，可将鼠标移到屏幕四角触发快捷操作（如显示桌面、锁屏、启动屏保 ……）

🔴 加速 macOS Dock 栏自动隐藏/显示速度
```bash
# 去掉 Dock 出现前的「延迟时间」
defaults write com.apple.dock autohide-delay -float 0
# 加速 Dock 的「动画时间」
defaults write com.apple.dock autohide-time-modifier -float 0.15
# 重启 Dock 使设置生效
killall Dock

# 恢复默认
defaults delete com.apple.dock autohide-delay
defaults delete com.apple.dock autohide-time-modifier
killall Dock
```

🔴 键盘 > 开启键盘导航




