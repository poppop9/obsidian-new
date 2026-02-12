
> [!NOTE] Bootstrap 可以轻松地创建响应式设计，而且提供了丰富的 JavaScript 插件

> [!NOTE] Bootstrap 的核心是**移动优先**，所以为一个较小的视口设置了样式，这个样式会在所有更大的视口中继续适用，除非对更大视口的添加新的样式

# 引入
## CDN
https://v5.bootcss.com/docs/getting-started/introduction/#quick-start

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" />
</head>

<body>
……
</body>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>

</html>
```

## npm

https://v5.bootcss.com/docs/getting-started/download/#npm

* `npm install bootstrap@5.3.0-alpha1`
* 在 `main.js` 中引入 BootStrap

```js
// 引入
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// 在注释掉其他的 css 文件，比如
// import './assets/main.css'
```

# 布局

## 容器

![800](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202402051731979.png)

### .container 固定宽度容器

> 提供了一个响应式的 _**固定宽度容器**_【`max-width` 会在不同的屏幕尺寸变化】

| 类                                | <p>Extra small<br>&#x3C;576px</p> | <p>Small<br>≥576px</p> | <p>Medium<br>≥768px</p> | <p>Large<br>≥992px</p> | <p>Extra large<br>≥1200px</p> | <p>XXL<br>≥1400px</p> |
| -------------------------------- | --------------------------------- | ---------------------- | ----------------------- | ---------------------- | ----------------------------- | --------------------- |
| `.container`                     | 100%                              | 540px                  | 720px                   | 960px                  | 1140px                        | 1320px                |
| `.container-md`                  | 100%                              | 100%                   | 720px                   | 960px                  | 1140px                        | 1320px                |
| `.container-lg`                  | 100%                              | 100%                   | 100%                    | 960px                  | 1140px                        | 1320px                |
| `.container-xl`                  | 100%                              | 100%                   | 100%                    | 100%                   | 1140px                        | 1320px                |
| `.container-xxl`                 | 100%                              | 100%                   | 100%                    | 100%                   | 100%                          | 1320px                |
| ## .container-fluid 全宽容器        |                                   |                        |                         |                        |                               |                       |
| 提供了一个**全宽容器**【`width` 总是 `100%`】 |                                   |                        |                         |                        |                               |                       |

## 网格布局

> 利用 `flexbox` ，共有 12 列【会根据屏幕大小，自动重排】 ![800](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202402051753353.png)

如果页面底部出现水平的滚动条，就在 `.row` 的 `<div>` 中加入 `.mx-auto`
```html
<div class="row mx-auto">
  <div class="col-9 mx-auto">
    <div class="row">
      <div class="col-2">
      </div>
      <div class="col-8">
        <span>慕课网</span>
      </div>
      <div class="col-2">
        <span>免费学习来自名校名师的精品课程</span>
      </div>
    </div>
  </div>
</div>
```

* **行**
  * `.row` 宽度是自动的，可能会超出父容器的宽度
* **列**
  * `.col-` 超小型设备 - 屏幕宽度小于 576px
  * `.col-auto` 自动所需分配空间
  * `.col-sm-` (小型设备 - 屏幕宽度等于或大于 576px)
  * `.col-md-` (中型设备 - 屏幕宽度等于或大于 768 像素)
  * `.col-lg-` (大型设备 - 屏幕宽度等于或大于 992 像素)
  * `.col-xl-` (xlarge 设备 - 屏幕宽度等于或大于 1200px)
  * `.col-xxl-` (xxlarge 设备 - 屏幕宽度等于或大于 1400px)
* **间隙**
  * `.g-*` 控制一行中列的间隙

### 自定义列宽
```html
/* 第一颗星 (*) 代表响应度：sm、md、lg、xl 或 xxl */
/* 第二颗星代表占用列数，所有列加起来不超过12 */
<div class="row g-3">
	<div class="col-*-*"></div>
	<div class="col-*-*"></div>
	<div class="col-*-*"></div>
</div>
------

/* 当屏幕小于576px时，每一列会占据宽度的100%，并向下堆叠 */
<div class="row">
	<div class="col-sm-4">.col-sm-4</div>
	<div class="col-sm-4">.col-sm-4</div>
	<div class="col-sm-4">.col-sm-4</div>
</div>

/* 在小屏幕设备时，3:9，而在中等屏幕设备时，55开 */
<div class="row">
	<div class="col-sm-3 col-md-6">....</div>
	<div class="col-sm-9 col-md-6">....</div>
</div>
```

### 自动均分列宽

```html
// 有三个col，所以每列会占用33.3%
<div class="row">
	<div class="col"></div>
	<div class="col"></div>
	<div class="col"></div>
</div>
```

## 栈式布局

> 栈式布局是一种简化的使用 `flexbox` 的功能

* `.vstack` 让其子元素垂直堆叠
* `.hstack` 让其子元素水平堆叠
* `.gap-*` 规定子元素之间的间隔

```html
// 垂直堆叠
<div class="vstack gap-3">
  <div class="bg-body-tertiary border">First item</div>
  <div class="bg-body-tertiary border">Second item</div>
  <div class="bg-body-tertiary border">Third item</div>
</div>

// 水平堆叠
<div class="hstack gap-3">
	<div class="bg-body-tertiary border">First item</div>
	<div class="bg-body-tertiary border">Second item</div>
	<div class="bg-body-tertiary border">Third item</div>
</div>

// 水平部分居右堆叠
<div class="hstack gap-3">
  <div class="bg-body-tertiary border">First item</div>
  <div class="bg-body-tertiary border ms-auto">Second item</div>
  <div class="bg-body-tertiary border">Third item</div>
</div>
```

> [!warning] 为什么水平部分居右堆叠要使用 `.ms-auto`，而不是其他居右的属性 ？ 因为此处的父容器 `.hstack` 已经使用了关于 flex 的属性了，为了不冲突，所以使 `margin-left: auto;`

# ❤️ 组件
## 警告框
在 `class属性` 上添加 `alert`

* 样式
	* `.alert-success`
	* `.alert-info`
	* `.alert-warning`
	* `.alert-danger`
	* `.alert-primary`
	* `.alert-secondary`
	* `.alert-light`
	* `.alert-dark`
* 关闭警告框按钮
	* `.alert-dismissible`
	* `.btn-close`
	* `data-bs-dismiss`

```html
<div class="alert alert-success alert-dismissible">
    <strong>成功！</strong> 此警报框表示成功或积极的动作
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

## 💛 按钮
### 样式
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202403161654341.png)

```html
<button type="button" class="btn-close"></button>
<button type="button" class="btn">基础</button>
<button type="button" class="btn btn-primary">主要</button>
<button type="button" class="btn btn-secondary">次要</button>
<button type="button" class="btn btn-success">成功</button>
<button type="button" class="btn btn-info">信息</button>
<button type="button" class="btn btn-warning">警告</button>
<button type="button" class="btn btn-danger">危险</button>
<button type="button" class="btn btn-dark">深色</button>
<button type="button" class="btn btn-light">浅色</button>
<button type="button" class="btn btn-link">链接</button>
```

***

![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202402161554945.png)

```html
<button type="button" class="btn btn-outline-primary">主要</button>
……
```

***

* `rounded-pill` 胶囊按钮

### 尺寸
```html
<button type="button" class="btn btn-primary btn-lg">大型</button>
<button type="button" class="btn btn-primary">默认</button>
<button type="button" class="btn btn-primary btn-sm">小型</button>
```

### 禁用
![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202402161619053.png)

* `.active` 活跃
* `disabled` 禁用

```html
<button type="button" class="btn btn-primary">主要按钮</button>
<button type="button" class="btn btn-primary active">活动的主要按钮</button>
<button type="button" class="btn btn-primary" disabled>禁用的主要按钮</button>
```

### 按钮组
使用带有 `.btn-group` 的 `<div>` 元素来创建按钮组

> [!attention] 不可以单独控制按钮组内按钮的大小，只能一起通过按钮组控制

> [!NOTE] 按钮组是 `inline`

* 尺寸
  * `.btn-group-lg`
  * ……默认
  * `.btn-group-sm`
* 方向
  * `.btn-group-vertical` 垂直
  * …… 水平

***

* 普通
```html
<div class="btn-group">
	<button type="button" class="btn btn-primary">华为</button>
	<button type="button" class="btn btn-primary">大疆</button>
	<button type="button" class="btn btn-primary">小米</button>
</div>
```

* 嵌套
```html
<div class="btn-group" role="group">
	<button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
  Dropdown
	</button>
	<ul class="dropdown-menu">
		<li><a class="dropdown-item" href="#">Dropdown link</a></li>
		<li><a class="dropdown-item" href="#">Dropdown link</a></li>
	</ul>
</div>
```

* 无缝复选框按钮组
```html
<div class="btn-group">
  <input type="checkbox" class="btn-check" id="btncheck1" autocomplete="off">
  <label class="btn btn-outline-primary" for="btncheck1">Checkbox 1</label>

  <input type="checkbox" class="btn-check" id="btncheck2" autocomplete="off">
  <label class="btn btn-outline-primary" for="btncheck2">Checkbox 2</label>

  <input type="checkbox" class="btn-check" id="btncheck3" autocomplete="off">
  <label class="btn btn-outline-primary" for="btncheck3">Checkbox 3</label>
</div>
```

## 💛 徽章
 `.badge` ，用于计数，打标签……，会自动匹配父元素的大小 ![](https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202402181053369.png)

### 样式
* 矩形徽章
```html
<span class="badge bg-primary">主要</span>
<span class="badge bg-secondary">次要</span>
<span class="badge bg-success">成功</span>
……
```

* 胶囊徽章
```html
<span class="badge bg-primary rounded-pill"></span>
```

### 用途
* 按钮内消息计数
```html
<button type="button" class="btn btn-primary">
  消息 <span class="badge bg-danger">4</span>
</button>
```

## 进度条
将 `.progress` 添加到父元素，将 `.progress-bar` 添加到子元素

* 进度：`width`
* 高度：`height`
* 动画：`.progress-bar-striped`，`.progress-bar-animated`

```html
<div class="progress" style="height:10px">
	<div class="progress-bar" style="width:40%">40%</div>
	// 多个进度条
	<div class="progress-bar bg-success" style="width:10%">40%</div>
</div>
```

## 加载器
* 样式
	* `.spinner-border` 旋转
	* `.spinner-grow` 增长
* 尺寸
	* `.spinner-border-lg`
	* ……
	* `.spinner-border-sm`

```html
<div class="spinner-border text-primary"></div>
```

```html
<!-- 向按钮添加加载器 -->
<button class="btn btn-primary">
	<span class="spinner-border spinner-border-sm"></span>
</button>
```

## 分页
* `.pagination` 分页父容器
* `.page-item` 子页面
* `.page-link` 子页面的链接
* `.disabled` 不可点击
* `.active` 突出显示当前页面

```html
<ul class="pagination">
	<li class="page-item"><a class="page-link" href="#">上一页</a></li>
	<li class="page-item active"><a class="page-link" href="#">1</a></li>
	<li class="page-item disabled"><a class="page-link" href="#">2</a></li>
	<li class="page-item"><a class="page-link" href="#">3</a></li>
	<li class="page-item"><a class="page-link" href="#">下一页</a></li>
</ul>
```

## 列表组
* `.list-group` 列表组父容器
* `.list-group-item` 列表项
* `.list-group-numbered` 带有数字
* `.list-group-horizontal` 水平列表组
* `list-group-item-action` 悬停效果

***

* **普通列表组**
```html
<ul class="list-group">
	<li class="list-group-item active">活动项目</li>
	<li class="list-group-item disabled">第二项</li>
	<li class="list-group-item list-group-item-info">第三项</li>
</ul>
```

* **链接列表组**
```html
<div class="list-group">
	<a href="#" class="list-group-item list-group-item-action">第一项</a>
	<a href="#" class="list-group-item list-group-item-action">第二项</a>
	<a href="#" class="list-group-item list-group-item-action">第三项</a>
</div>
```

* **徽章列表组**
```html
<ul class="list-group">
	<li class="list-group-item d-flex justify-content-between align-items-center">
		收件箱
		<span class="badge bg-primary rounded-pill">12</span>
	</li>
	<li class="list-group-item d-flex justify-content-between align-items-center">
		广告邮件
		<span class="badge bg-primary rounded-pill">50</span>
	</li>
	<li class="list-group-item d-flex justify-content-between align-items-center">
		垃圾箱
		<span class="badge bg-primary rounded-pill">99</span>
	</li>
</ul>
```
