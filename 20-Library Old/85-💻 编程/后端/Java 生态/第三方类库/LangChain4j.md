# 介绍
🧩 LangChain4j 是简化将 LLM 集成到 Java 应用程序的框架，提供了统一的 API，可以轻松切换不同的 LLM 或嵌入存储；还提供了各种工具（包含低级提示模板、聊天记忆管理、RAG）

🧩 功能 ：
- 集成 [15+ 个 LLM](https://docs.langchain4j.info/integrations/language-models)
- 集成 [20+ 个嵌入存储](https://docs.langchain4j.info/integrations/embedding-stores)
- 集成 [15+ 个嵌入模型](https://docs.langchain4j.info/category/embedding-models)
- 集成 [5 个图像生成模型](https://docs.langchain4j.info/category/image-models)
- 集成 [2 个评分（重排序）模型](https://docs.langchain4j.info/category/scoring-reranking-models)
- 集成一个审核模型（OpenAI）
- 支持文本和图像作为输入（多模态）
- [AI 服务](https://docs.langchain4j.info/tutorials/ai-services)
- 提示模板
- 实现持久化和内存中的[聊天记忆](https://docs.langchain4j.info/tutorials/chat-memory)算法：消息窗口和令牌窗口
- [从 LLM 流式传输响应](https://docs.langchain4j.info/tutorials/response-streaming)
- 用于常见 Java 类型和自定义 POJO 的输出解析器
- [工具（函数调用）](https://docs.langchain4j.info/tutorials/tools)
- 动态工具（执行动态生成的 LLM 代码）
- 文本分类
- 用于分词和估算令牌数的工具
- [RAG（检索增强生成）](https://docs.langchain4j.info/tutorials/rag)：
  - 摄取：
    - 从多个来源（文件系统、URL、GitHub、Azure Blob Storage、Amazon S3 等）导入各种类型的文档（TXT、PDF、DOC、PPT、XLS 等）
    - 使用多种分割算法将文档分割成更小的段落
    - 文档和段落的后处理
    - 使用嵌入模型嵌入段落
    - 在嵌入（向量）存储中存储嵌入
  - 检索（简单和高级）：
    - 查询转换（扩展、压缩）
    - 查询路由
    - 从向量存储和/或任何自定义源检索
    - 重排序
    - 倒数排名融合
    - 自定义 RAG 流程中的每个步骤

🧩 LangChain4j 项目结构
- `langchain4j-core` 定义核心抽象
- `langchain4j` 包含文档加载器、[聊天记忆](https://docs.langchain4j.info/tutorials/chat-memory)、[AI 服务](https://docs.langchain4j.info/tutorials/ai-services)
- `langchain4j-{integration}` 提供与各种 LLM 和嵌入存储的集成

🧩 使用场景
- 实现一个自定义的 AI 驱动的聊天机器人，它可以访问您的数据并按照您想要的方式行事：
- 处理大量非结构化数据（文件、网页等）并从中提取结构化信息
- 生成、转换信息


[Spring Boot 集成](https://github.com/langchain4j/langchain4j-spring)

[示例](https://github.com/langchain4j/langchain4j-examples)
