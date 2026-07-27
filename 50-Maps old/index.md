
```dataview
TABLE WITHOUT ID
  unique(file.outlinks) AS "引用的笔记（`= length(unique(this.file.outlinks))`）",
  unique(file.inlinks) AS "引用我的笔记（`= length(unique(this.file.inlinks))`）"
WHERE file.path = this.file.path
```

# 分类
- [哲学](02-🤔%20哲学/哲学.md)

