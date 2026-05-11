---
name: cnb-pipeline
description: 编写/修改 .cnb.yml 配置，诊断流水线失败原因，优化构建性能。
supports: cnb
image: cnbcool/default-npc
---

# CNB 流水线配置与诊断

生成/修改 `.cnb.yml` 配置文件，诊断流水线失败，优化构建性能。

> 本文档 URL 中的 `${CNB_WEB_PROTOCOL:-https}` 和 `${CNB_WEB_HOST:-cnb.cool}` 为环境变量，使用前先 `echo` 获取实际值再拼接。

## 模式判定

根据用户意图自动选择工作模式：

- **配置模式**（写/改流水线）→ 走下方「配置工作流程」
- **诊断模式**（失败/报错/慢/优化）→ 走下方「诊断工作流程」

## 配置工作流程

1. **了解需求** -- 明确触发分支、事件、构建语言/环境、构建步骤、特殊需求。信息充足可直接生成。
2. **查看现有配置** -- 修改场景下先读取 `.cnb.yml` 和 `.ci/` 目录。
3. **按需加载文档** -- 遇到不确定的语法细节时，先 `echo` 获取环境变量拼接文档 URL，再用 WebFetch 加载对应的深入文档链接；也可读取本 skill 的 `references/` 子目录下的参考文件。
4. **生成配置** -- 按下方语法速查生成完整可运行的配置。
5. **校验（必须）** -- 每次生成/修改后必须校验通过才能展示给用户。
6. **解释配置** -- 简要说明关键部分。

### 校验命令

```bash
[ -d validator/node_modules ] || npm install --prefix validator
node validator/validate.js .cnb.yml
```

两项均通过（`YAML 语法` + `Schema`）才算有效。`--refresh` 可强制更新 Schema 缓存。

## 诊断工作流程

> 详细流程见 `references/diagnose-guide.md`，依赖 [cnb-api] skill。

1. **确定构建 sn**（可选）-- 默认不传，CLI 自动解析；需指定时从 `cnb pulls check-status` 对应检查项的 `target_url` 末段取（勿用 `context` 字段）。
2. **获取数据**：
   - 失败诊断：`cnb pulls get-ci-logs`（自动定位失败构建；也可加 `--sn` 指定）
   - 性能优化：通过 `cnb build --help` / `cnb pulls --help` 探索可用命令，获取 Stage 耗时与慢 Stage 日志
3. **分析并输出报告** -- 判定失败类型或耗时瓶颈，给出修复/优化建议。配置相关问题结合语法速查分析。

---

## 语法速查

### 层级结构

```
分支 (main / "feature/*" / "$")
  └── 事件 (push / pull_request / tag_push ...)
      └── Pipeline（多条并发）
          └── Stage（顺序执行）
              └── Job（数组串行 / 对象并行）
```

### 触发分支

```yaml
main: # 精确匹配
"feature/*": # 通配符
"(main|develop)": # 或匹配
"**/!(main|develop)": # 排除
"**": # 所有分支
"$": # 兜底（未被 glob 匹配的分支 + tag_push/issue 等）
```

### 常用触发事件

| 事件                          | 时机                         |
| ----------------------------- | ---------------------------- |
| `push`                        | 推送代码                     |
| `pull_request`                | PR 创建/重新打开/源分支 push |
| `tag_push`                    | 推送 Tag                     |
| `"crontab: 30 5 * * *"`       | 定时任务                     |
| `web_trigger` / `api_trigger` | 手动/API 触发                |

> 完整事件列表及代码版本说明见 `references/syntax-reference.md` 或在线文档：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/trigger-rule.md

### Pipeline 骨架

```yaml
main:
  push:
    - name: ci
      runner: { cpus: 2 }
      docker:
        image: node:20 # 或 build (Dockerfile) 或 devcontainer
      services: [docker] # Docker-in-Docker
      env: { NODE_ENV: production }
      imports: [./secrets.yml]
      stages: [...]
      failStages: [...] # 仅失败时执行
      endStages: [...] # 始终执行
```

### Stage

```yaml
stages:
  - name: install
    script: npm ci
    timeout: 10m
    retry: 2
    allowFailure: true
    ifModify: ["**/*.ts"]
    image: node:18 # 覆盖 Pipeline 镜像
    env: { KEY: value }
```

### Job（三种类型）

```yaml
# 脚本任务
- name: build
  script: npm run build

# 插件任务
- name: docker-push
  image: plugins/docker
  settings: { repo: myrepo/app, tags: [$CNB_BRANCH] }

# 内置任务
- name: trigger
  type: cnb:trigger
  options: { slug: org/other-repo, branch: main, event: api_trigger }
  exports: { sn: BUILD_SN }
```

**并发模式**：`jobs` 为数组时串行，为对象时并行。

### 环境变量（速查）

```yaml
env: { MY_VAR: value } # 声明
imports: [./secrets.yml] # 导入密钥仓库
exports: { VERSION: MY_VERSION } # 跨 Stage 传递
```

脚本中输出 `##[set-output key=value]` 可导出变量。

> 详细用法见 `references/env-variables.md` 或在线文档：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/env.md

### 常用内置变量

| 变量                              | 说明        |
| --------------------------------- | ----------- |
| `CNB_BRANCH`                      | 分支/Tag 名 |
| `CNB_COMMIT` / `CNB_COMMIT_SHORT` | Commit SHA  |
| `CNB_REPO_SLUG`                   | 仓库路径    |
| `CNB_BUILD_ID`                    | 构建 ID     |
| `CNB_TOKEN`                       | 构建凭证    |
| `CNB_EVENT`                       | 事件名      |
| `CNB_PULL_REQUEST_IID`            | PR 编号     |

> 完整列表：${CNB_WEB_PROTOCOL:-https}://docs.${CNB_WEB_HOST:-cnb.cool}/zh/build/build-in-env.md

### Include 和 !reference

```yaml
include:
  - .ci/build.yml # 本地
  - "${CNB_WEB_ENDPOINT:-https://cnb.cool}/org/tpl/-/blob/main/ci.yml" # 远程

docker: !reference [.docker-config] # 引用对象
stages: !reference [.common-pipeline, stages] # 多级路径引用
```

### 数据卷缓存

```yaml
docker:
  volumes:
    - node_modules # cow（默认，写时复制）
    - cache:/root/.npm:rw # 读写
    - shared:/data:data # 临时数据卷（Pipeline 内共享）
```

---

## 详细参考文档

需要深入了解某个主题时，读取以下文件：

| 文件                             | 内容                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `references/syntax-reference.md` | 完整触发事件列表、Pipeline/Stage/Job 全部字段、变量替换规则、include 合并规则 |
| `references/builtin-tasks.md`    | 所有内置任务类型（cnb:trigger、git:release 等）及参数说明                     |
| `references/env-variables.md`    | 环境变量声明/导入/导出/传递的完整用法                                         |
| `references/best-practices.md`   | YAML 锚点复用、按功能拆分 .ci/ 目录、Pipeline 编排等最佳实践                  |
| `references/diagnose-guide.md`   | CI 失败诊断流程、性能优化分析流程、失败类型判定表、常见优化点                 |

---

## 注意事项

1. **YAML 缩进**用空格，不用 Tab
2. **分支名含特殊字符**需引号包裹：`"feature/*"`
3. **并发模型**：同事件多 Pipeline 并发；Pipeline 内 Stage 顺序；Stage 内 jobs 数组串行、对象并行
4. **PR 安全限制**：PR 类事件 `CNB_TOKEN` 权限受限，敏感操作放 `push` / `pull_request.target` / `tag_push`
5. **YAML 锚点仅限单文件**：跨文件用 `!reference`（只能引用值，不能合并展开）
6. **`!reference` 引用键名必须全局唯一**：跨文件共享时加文件/模块前缀避免冲突
7. **变量值上限 100KiB**，变量名只能含字母/数字/下划线且不能数字开头
