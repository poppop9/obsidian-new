DaisyUI 5 完全兼容 Tailwind CSS 4

# ❤️ 主题
- 将 `@plugin "daisyui";` 替换为
```css
@plugin "daisyui" {
	themes: light --default, dark --prefersdark;
}
```
# ❤️ 按钮
<u>颜色，样式</u> ：
- 深色背景按钮
```jsx
<button className="btn btn-neutral">Neutral</button>
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-accent">Accent</button>
<button className="btn btn-info">Info</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-warning">Warning</button>
<button className="btn btn-error">Error</button>
```
- 浅色背景按钮 `btn-soft` 
- 无色背景按钮 `btn-outline` 
- 链接按钮 `btn-link` 

---

<u>大小</u> ：
- `btn-block` 按钮块
- `btn-wide` 宽按钮

# ❤️ 数据展示
## List
https://daisyui.com/components/list/
