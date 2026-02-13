# H1 标题 - 最大级别标题
## H2 标题 - 二级标题
### H3 标题 - 三级标题
#### H4 标题 - 四级标题
##### H5 标题 - 五级标题
###### H6 标题 - 六级标题

---

## 段落与文本样式

这是一个普通段落。GitHub 风格的排版注重可读性，行高为 1.5，字体使用系统默认的 San Francisco（macOS）、Segoe UI（Windows）或 Roboto（Android）。

这是 **粗体文本**，这是 _斜体文本_，这是 _**粗斜体文本**_。

这是 ~~删除线文本~~，这是 `行内代码`，这是 ==高亮文本==。

这是一个包含 [链接](https://github.com/) 的段落。

---

## 引用块

> 这是一个简单的引用。
> 
> 引用可以包含多个段落。

> ### 引用中可以包含标题
> 
> > 这是嵌套的引用内容

---

## 列表
### 无序列表

- 第一项
- 第二项
    - 嵌套项 1
    - 嵌套项 2
        - 更深层嵌套
- 第三项

### 有序列表

1. 第一步
2. 第二步
    1. 子步骤 2.1
    2. 子步骤 2.2
3. 第三步

### 任务列表

- [x] 已完成的任务
- [x] 另一个已完成的任务
- [ ] 待办事项
- [ ] 另一个待办事项
    - [ ] 嵌套待办
    - [x] 嵌套已完成

---

## 代码块

### 行内代码

使用 `console.log()` 输出信息，或者使用 `const` 声明常量。

### 代码块（无语言标识）

```
这是一个纯文本代码块
没有语法高亮
可以用于展示纯文本内容
```

### Python 代码

```python
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 输出前 10 个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### JavaScript 代码

```javascript
// ES6 箭头函数示例
const greet = (name) => {
  return `Hello, ${name}!`;
};

// 使用 async/await
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 表格

### 基础表格

| 功能   | 支持情况   | 说明        |
| ---- | ------ | --------- |
| 标题样式 | ✅ 完全支持 | H1-H6 全支持 |
| 代码块  | ✅ 完全支持 | 支持语法高亮    |
| 表格   | ✅ 完全支持 | 带斑马纹      |
| 链接   | ✅ 完全支持 | GitHub 蓝色 |
| 图片   | ✅ 完全支持 | 自适应宽度     |

### 复杂表格

|左对齐|居中对齐|右对齐|
|:--|:-:|--:|
|内容 1|内容 2|内容 3|
|较长的内容项|中等长度|短|
|A|B|C|

### 包含代码的表格

|语言|示例代码|输出|
|---|---|---|
|Python|`print("Hello")`|Hello|
|JavaScript|`console.log("Hi")`|Hi|
|Java|`System.out.println("Hey")`|Hey|

---

## 水平分割线

---

## 链接

### 各种类型的链接

- [普通链接](https://github.com/)
- [带标题的链接](https://github.com/ "GitHub 官网")
- [https://自动链接.com](https://xn--6fr480bf0wh4q.com/)
- [相对路径链接](https://claude.ai/chat/other-file.md)
- [[Obsidian 双链接]]

### 参考式链接

这是一个 [参考链接](https://github.com/ "GitHub")，这是另一个 [参考链接](https://obsidian.md/ "Obsidian")。

---

## 图片

### 普通图片

![示例图片](https://via.placeholder.com/600x400)

### 带链接的图片

[![点击图片访问](https://via.placeholder.com/400x200)](https://github.com/)

---

## Callout（提示框）
> [!quote] 描述某个名词，概念

> [!NOTE] 这是一个笔记类型的 Callout，用于提供额外信息。

> [!TIP] 这是一个提示 Callout，用于给出有用的建议。

> [!WARNING] 这是一个警告 Callout，用于提醒注意事项。

> [!DANGER] 这是一个危险 Callout，用于标识严重问题。

> [!INFO] 这是一个信息 Callout，提供背景知识。

> [!todo] 

> [!example] 描述例子

> [!fail] 测试

> [!success] 测试

> [!summary] 测试

> [!faq] 测试

> [!bug] 测试

- quote、cite
- note
- tip、hint、important
- warning、attention、caution
- error、danger
- info
- todo
- example
- fail、failure、missing
- success、check、done
- summary、abstract、tldr
- faq、help、question
- bug

## 脚注

这是一个包含脚注的句子[^1](https://claude.ai/chat/%E8%BF%99%E6%98%AF%E7%AC%AC%E4%B8%80%E4%B8%AA%E8%84%9A%E6%B3%A8%E7%9A%84%E5%86%85%E5%AE%B9%E3%80%82)。这是另一个脚注[^note](https://claude.ai/chat/%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E5%91%BD%E5%90%8D%E8%84%9A%E6%B3%A8%E7%9A%84%E5%86%85%E5%AE%B9%EF%BC%8C%E5%8F%AF%E4%BB%A5%E5%8C%85%E5%90%AB%E5%A4%9A%E4%B8%AA%E6%AE%B5%E8%90%BD%E3%80%82)。

```
脚注可以包含多个段落，只需正确缩进。
```

---

## 键盘按键

使用 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制，<kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴。

在 Mac 上使用 <kbd>Cmd</kbd> + <kbd>Q</kbd> 退出应用。


## 特殊字符

### HTML 实体

© ® ™   < > &

### Emoji
➜ ➤ ←
🧩
📍
💡
💬🗨️🗯️💭🗯 🗨👁‍🗨
💤
🪶
☄️ 彗星
🥏 飞碟
✨️
📝
🎯
⚠️
🌞⭐🌟