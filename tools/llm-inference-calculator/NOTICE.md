# 来源与集成说明

- 原项目：Po Chen 的 [LLM Inference Calculator](https://github.com/pochenai/llm-inference-calculator)。
- 原项目 README 声明的许可证：MIT；原 README 与中文 README 随源码保留。上游当前没有独立 LICENSE 文件，未补写或推定额外授权条款。
- 基线提交：`1d69ab9`，导入时保留用户本地已移除 Star 解锁限制的修改。
- 此目录是网站内独立构建的 npm workspace，不依赖本机外部目录。计算核心、硬件/模型数据和原有算法测试保持原样。
- 网站适配仅涉及构建路径、返回导航、来源说明与移除 Vercel 统计调用；不将原项目标注为原创。
- 独立工具的 Vite / Vitest 开发依赖使用已修复版本，不改变计算逻辑。

未来更新请在此目录明确同步、测试并随网站提交；不会自动读取 `D:` 盘上的原项目。
