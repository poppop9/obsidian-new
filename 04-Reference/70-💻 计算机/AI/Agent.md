# OpenClaw
OpenClaw 的中心是一个 Gateway，把你通过 WhatsApp、Telegram、Slack、Discord 等发的所有消息路由到这个统一入口，AI 在一个地方处理所有任务
- 缺陷 —— OpenClaw 没有内置的「从经验中学习」机制。AI 想出了某个处理邮件的好方法，明天它就忘了
- 优势 —— 支持 24+ 消息平台，社区里有 13,000+ Skills




# Hermes Agent
[Hermes Agent](https://hermesagent.org.cn/) 会在任务执行完成后评估刚才发生了什么，如果方法不平凡，就将推理模式提取为一个「Skills」保存下来。未来遇到类似任务时自动检索这个模式，Skills 也会随新结果不断精炼
- 缺陷 —— 自我反思和优化模块比普通 Agent 多消耗 15-25% 的 token；episodic memory 依赖 ChromaDB
- 优势 —— 自动生成 Skills；比 OpenClaw 安全


