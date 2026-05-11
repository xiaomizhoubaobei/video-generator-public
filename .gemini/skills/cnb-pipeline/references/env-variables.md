# CNB 环境变量详解

## 声明和导入

```yaml
- env: # Pipeline/Job 级
    MY_VAR: value
  imports: # 导入密钥仓库文件
    - ./secrets.yml
    - $NEXT_FILE # 前面文件的变量对后面有效
```

`env` 与 `imports` key 冲突时，`env` 优先。

---

## 导出和传递（跨 Stage）

### 方式 1：从脚本输出解析

```yaml
- name: set-version
  script: echo "##[set-output VERSION=1.0.0]"
  exports:
    VERSION: MY_VERSION # from-key: to-key
```

### 方式 2：从执行结果导出

```yaml
- name: run-script
  script: echo -n "hello"
  exports:
    info: SCRIPT_OUTPUT # info/code/stdout/stderr/skip
```

### 方式 3：从内置任务导出

```yaml
- name: release
  type: git:release
  options: { tag: v1.0.0 }
  exports:
    version: RELEASE_VERSION
```

---

## set-output 编码

`##[set-output key=value]` 支持以下编码前缀（用于含换行等特殊字符的值）：

- `##[set-output key=base64,<base64编码值>]`
- `##[set-output key=escape<转义值>]`

变量值上限 **100KiB**。

---

## 变量替换

以下字段支持 `$VAR` 替换：

- `env`、`imports`
- `options` / `optionsFrom`
- `settings` / `settingsFrom`
- `docker`（image / build / volumes）
- `stage.image`
- `ifModify`、`name`
- `lock.key`、`allowFailure`
- `runner.tags`

用 `\$` 阻止替换。

---

## 常用内置变量

| 变量                                                 | 说明                        |
| ---------------------------------------------------- | --------------------------- |
| `CNB_BRANCH`                                         | 分支/Tag 名                 |
| `CNB_COMMIT` / `CNB_COMMIT_SHORT`                    | Commit SHA                  |
| `CNB_REPO` / `CNB_REPO_SLUG`                         | 仓库路径                    |
| `CNB_BUILD_ID` / `CNB_BUILD_USER`                    | 构建 ID / 触发用户          |
| `CNB_TOKEN` / `CNB_TOKEN_USER_NAME`                  | 构建凭证（PR 事件权限受限） |
| `CNB_EVENT` / `CNB_EVENT_URL`                        | 事件名 / 事件链接           |
| `CNB_PULL_REQUEST_IID` / `CNB_PULL_REQUEST_PROPOSER` | PR 编号 / 提交者            |
| `CNB_PIPELINE_KEY` / `CNB_PIPELINE_NAME`             | Pipeline key / name         |
| `CNB_DEFAULT_BRANCH`                                 | 默认分支名                  |
| `CNB_BUILD_WORKSPACE`                                | 工作空间路径                |

> **完整列表**：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/build-in-env.md

---

## 变量命名规则

- 只能包含字母、数字、下划线
- 不能以数字开头
- 大小写敏感

> **在线文档**：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/env.md
