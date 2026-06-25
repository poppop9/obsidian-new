# 物理
```dataview
LIST
FROM #物理
```

# 问题
```dataview
LIST
FROM #问题
```

# 重构
```dataview
LIST
FROM #重构
```

# 未知
```dataview
LIST
FROM #未知
```

# 未关联的永久笔记
```dataview
LIST
FROM "02-Permanent"
WHERE length(file.inlinks) = 0
```