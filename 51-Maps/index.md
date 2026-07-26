
```dataview
TABLE WITHOUT ID
  unique(file.outlinks) AS "引用的笔记（`= length(unique(this.file.outlinks))`）",
  unique(file.inlinks) AS "引用我的笔记（`= length(unique(this.file.inlinks))`）"
WHERE file.path = this.file.path
```

# 分类
- [传统玄学](🌌%20传统玄学/传统玄学.md)
- [中医](中医/中医.md)
- [语言学](🗣%20语言学/语言学.md)

