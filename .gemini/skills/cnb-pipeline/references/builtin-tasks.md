# CNB 内置任务参考

所有内置任务通过 `type` 字段指定，用 `options` 传参，用 `exports` 导出结果。

```yaml
- name: my-task
  type: <type>
  options:
    key: value
  # optionsFrom: options.yml     # 从文件加载 options
  exports:
    output_key: ENV_VAR_NAME
```

---

## 任务一览

| 类型                           | 功能                         | 关键参数                                        |
| ------------------------------ | ---------------------------- | ----------------------------------------------- |
| `cnb:resolve` / `cnb:await`    | 多 Pipeline 协作（同事件内） | `key`, `data`(resolve)                          |
| `cnb:apply`                    | 触发同仓库子流水线           | `event`, `configFrom`, `sync`                   |
| `cnb:trigger`                  | 触发其他仓库流水线           | `slug`, `event`, `branch`, `env`, `sync`        |
| `cnb:read-file`                | 读取文件为环境变量           | `filePath`                                      |
| `cnb:destroy-token`            | 销毁 CNB_TOKEN               | 无                                              |
| `docker:cache`                 | 构建 Docker 缓存镜像         | `dockerfile`, `by`, `versionBy`                 |
| `git:auto-merge`               | 自动合并 PR                  | `mergeType`, `removeSourceBranch`               |
| `git:reviewer`                 | 添加/删除评审人              | `type`, `reviewers`, `count`, `reviewersConfig` |
| `git:release`                  | 发布 Release                 | `tag`, `description`, `descriptionFromFile`     |
| `git:issue-update`             | 更新 Issue 状态/标签         | `state`, `label`, `when`, `fromFile`            |
| `git:pr-update`                | 更新 PR 标签/标题            | `label`, `title`                                |
| `git:pr-commit-message-preset` | 预设 PR 提交信息             | `message`                                       |
| `testing:coverage`             | 单测覆盖率上报               | `pattern`, `lang`, `lines`, `diffLines`         |
| `artifact:remove-tag`          | 删除制品标签                 | `name`, `tags`, `type`                          |
| `tapd:status-update`           | 更新 TAPD 状态               | `status`, `type`, `when`                        |
| `tapd:comment`                 | TAPD 评论                    | `comment`, `type`                               |
| `vscode:go`                    | 控制云开发环境可用时机       | 无                                              |

> **在线文档**：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/internal-steps.md

---

## 常用示例

### cnb:trigger（触发其他仓库）

```yaml
- name: trigger-deploy
  type: cnb:trigger
  options:
    slug: org/deploy-repo
    branch: main
    event: api_trigger
    env:
      VERSION: $VERSION
    sync: true # 同步等待完成
  exports:
    sn: BUILD_SN
```

### cnb:await / cnb:resolve（多 Pipeline 协作）

```yaml
# Pipeline A：完成后通知
- name: notify-ready
  type: cnb:resolve
  options:
    key: frontend-ready
    data: { version: $VERSION }

# Pipeline B：等待通知
- name: wait-frontend
  type: cnb:await
  options:
    key: frontend-ready
  exports:
    version: FRONTEND_VERSION
```

### git:release（发布 Release）

```yaml
- name: release
  type: git:release
  options:
    tag: v1.0.0
    description: "Release v1.0.0"
    # descriptionFromFile: CHANGELOG.md
  exports:
    version: RELEASE_VERSION
```

### git:auto-merge（自动合并 PR）

```yaml
- name: auto-merge
  type: git:auto-merge
  options:
    mergeType: squash
    removeSourceBranch: true
```

### testing:coverage（覆盖率上报）

```yaml
- name: coverage
  type: testing:coverage
  options:
    pattern: coverage/lcov.info
    lang: javascript
    lines: 80 # 总覆盖率阈值
    diffLines: 90 # 增量覆盖率阈值
```
