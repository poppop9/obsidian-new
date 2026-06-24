# 方法层（怎么写笔记）
## Zettelkasten 卡片盒笔记
Zettelkasten 不是存储信息的工具，它是你交流的对象，目的是激发你的灵感，让你持续思考。所以 Zettelkasten 应该只存放思考类的笔记（可以演化、可以被引用、可以与其他想法产生碰撞），非思考类的笔记不应该存放进来，因为它天然就是独立文档

原则 —— one note one idea

示例网站
- https://notes.andymatuschak.org/About_these_notes
- https://github.com/jorgealves/obsidian-vaults/tree/main
- https://github.com/deathau/sliding-panes-obsidian

### 笔记生命周期
inbox —— 放一些临时的灵感笔记

literature —— 原始素材库。放置加工过提炼过的观点

permanent —— 提炼后的观点。注意 ：从 literature 提炼观点到 permanent 后，literature 的原内容依然保留，不用因为重复而删除。具体笔记结构见 [permanent](../05-Assets/templates/permanent.md)
- 卡片里不需要做文件夹分类，因为知识其实是互通的，一张卡片可以同时属于多个分类

### 落地方案
所有的笔记都会被直接 / 间接引用到一个主页面的 note 里

用 yaml 的 tags 进行分类

笔记中要关联，笔记末尾也要关联

Frontmatter 元数据 - 有助于搜索和查询

链接笔记一定要说明两个笔记之间的关系

```
# Decision Making Framework

## Related Concepts
- [[Confirmation Bias]] - 偏见如何影响决策
- [[Time Pressure Effects]] - 紧迫感如何改变决策质量
- [[Team Dynamics]] - 团队与个人决策的差异
```

在每个笔记的下面用 dataview 来收集该笔记的反链

把读书笔记里的分类给拆除掉，用 tags 替换

### Evergreen Notes 常青笔记
常青笔记简单来说就是在 Zettelkasten 的基础上，将 permanent 笔记的名字改为一个「可以被反驳的观点」，并且这个 permanent 笔记一定与其他笔记有关联，不可以有孤立笔记

- ✅ 正确的命名
```
反馈的效力随时间间隔指数衰减

主动倾听要求暂时悬置自己的判断

冲突中先命名情绪再讨论事实更容易被接受
```
- ❌ 错误的命名
```
情商的五大体系

驾驶理论

中医理论
```

> 常青笔记是 Andy Matuschak（前 Apple 工程师）在 2019 年提出的笔记方法论，深受 Zettelkasten 启发，可以说是为数字时代重新诠释的 Zettelkasten
> 
> 常青这个比喻来自园艺，常青树不随季节枯萎，笔记也应该随认知不断更新，而不是写完就封存

## Cornell Notes 康奈尔笔记法

# 组织层（笔记放哪里）
## PARA

| 分类  | 含义        | 特点                                |
| --- | --------- | --------------------------------- |
| P   | Projects  | 有明确目标和截止时间的项目                     |
| A   | Areas     | 你必须持续维护的事情，你不维护就会出问题              |
| R   | Resources | 你感兴趣或未来可能用到的项目，你不维护也不会出事          |
| A   | Archives  | 曾经活跃，现在已完成、休眠的、失效的项目，你一般不会主动去翻的地方 |

# 导航层（怎么找到笔记）
## MOC
MOC 是帮助你进入某个知识领域的导航入口，是一个围绕某个主题，把相关笔记链接组织起来的导航中心

MOC 不是一开始就建立的，而是自下而上的（先有笔记，再有 MOC）

MOC 是手动策划的知识地图，你主动决定这些笔记应该聚在一起

MOC 可以加自己的评论和导读。有主观判断在里面，是你知识体系的体现

```
# 机器学习 MOC

## 基础概念
- [[监督学习]]
- [[无监督学习]]
- [[损失函数]]

## 算法
- [[线性回归]]
- [[决策树]]
- [[神经网络]]

## 实践
- [[模型评估]]
- [[特征工程]]
```

MOC 可以同时链接 permanent 和 literature，没有任何限制

```
01-literature/
  书-情商-丹尼尔·戈尔曼.md   ← 全书摘录、章节要点，按现有5章结构组织

02-permanent/
  情绪调节先于情绪压制.md     ← 从书里提炼出的、你认同的观点
  共情能力可以通过练习习得.md  ← 另一个值得单独成卡的观点
  （可能只有3-5张，不需要很多）

03-moc/01-areas/
  MOC-情绪与人际.md           ← 汇聚相关永久笔记的入口
    链接 → [[情绪调节先于情绪压制]]
    链接 → [[共情能力可以通过练习习得]]
    链接 → [[书-情商-丹尼尔·戈尔曼]]（literature 直接链过来）
```

```
01-literature/
  情商/
    书-情商-总览.md          ← 基本信息、整体评价、提炼出的永久笔记索引
    书-情商-1-认识自己.md
    书-情商-2-管理自己.md
    书-情商-3-激励自己.md
    书-情商-4-认识别人.md
    书-情商-5-管理别人.md
```

## TOC
TOC 是一篇文章内部的目录，是线性的、有顺序的

## Index
Index 是检索，没有你的判断，不需要你手动维护，是机械的、自动的、穷举的




