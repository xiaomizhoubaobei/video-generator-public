---
name: cnb-api
description: CNB 平台交互命令，支持仓库、Issue、PR、流水线、制品库等操作。
---

# cnb-api

操作 CNB 平台资源的 CLI 工具。

## 快捷命令

issues:

- `cnb issues get` — 获取当前 Issue 详情
- `cnb issues list-comments` — 列出当前 Issue 评论
- `cnb issues comment --body '内容'` — 发表评论到当前 Issue
- `cnb issues close` — 关闭当前 Issue
- `cnb issues open` — 打开当前 Issue
- `cnb issues list-labels` — 列出当前 Issue 标签
- `cnb issues add-labels --labels bug --labels feature` — 添加标签到当前 Issue
- `cnb issues list-assignees` — 查看当前 Issue 处理人
- `cnb issues add-assignees --assignees username` — 添加处理人到当前 Issue
- `cnb issues upload-file --file 文件路径` — 上传文件到当前 Issue
- `cnb issues upload-image --file 图片路径` — 上传图片到当前 Issue

pulls:

- `cnb pulls get` — 获取当前 PR 详情
- `cnb pulls list-files` — 列出当前 PR 变更文件
- `cnb pulls list-commits` — 列出当前 PR 提交记录
- `cnb pulls list-comments` — 列出当前 PR 评论
- `cnb pulls comment --body '内容'` — 发表 PR 评论
- `cnb pulls list-labels` — 列出当前 PR 标签
- `cnb pulls add-labels --labels ready --labels approved` — 添加标签到当前 PR
- `cnb pulls check-status` — 获取当前 PR 的 CI 状态
- `cnb pulls get-ci-logs` — 获取当前 PR 的 CI 构建日志
- `cnb pulls list-reviews` — 查看当前 PR 的评审列表
- `cnb pulls list-assignees` — 查看当前 PR 处理人
- `cnb pulls upload-file --file 文件路径` — 上传文件到当前 PR
- `cnb pulls upload-image --file 图片路径` — 上传图片到当前 PR

注意事项：

- **参数自动识别**：快捷命令中的 Issue/PR 编号会自动从环境变量识别，无需额外传递。
- **默认仅需摘要**：默认会精简响应输出结果，只返回核心字段。添加 `--verbose` 输出完整数据。
- **单引号传参**：传递多行文本参数时，使用单引号可防止命令注入攻击，并减少不必要的转义。
- **快捷命令适用范围**: 快捷命令只能操作当前仓库的当前 Issue/PR，跨仓库或跨编号操作请参考 `更多 API`。
- **npc提及和召唤的区别**: 评论中直接 @npc 会召唤 npc 干活，如果只提及不召唤，应该去掉 `@` 符号，或使用反引号包裹 `@npc`。

## 更多 API

1. `cnb --help` 查看所有模块
2. `cnb <module> --help` 查看模块下的工具列表
3. `cnb <module> <tool> --help` 查看工具参数
