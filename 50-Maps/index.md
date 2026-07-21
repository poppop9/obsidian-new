
```dataview
TABLE WITHOUT ID
  unique(file.outlinks) AS "引用的笔记（`= length(unique(this.file.outlinks))`）",
  unique(file.inlinks) AS "引用我的笔记（`= length(unique(this.file.inlinks))`）"
WHERE file.path = this.file.path
```

# 分类
- [易学](00-☯️%20易学/易学.md)
- [术数](01-🔮%20术数/术数.md)
- [哲学](02-🤔%20哲学/哲学.md)
- [心理学](05-🧠%20心理学/心理学.md)
- [健康科学](10-🩺%20健康科学/健康科学.md)
- [语言学](80-🗣%20语言学/语言学.md)
- [文学](85-📕%20文学/文学.md)
- [自然科学](88-🔬%20自然科学/自然科学.md)
