# CNB 流水线最佳实践

## 1. 用 YAML 锚点复用同文件内的配置

以 `.` 开头的 key 不会被识别为分支名，适合定义可复用片段。

```yaml
.node-env: &node-env
  docker:
    image: node:20
    volumes: [node_modules]

.install: &install
  name: install
  script: npm ci

main:
  push:
    - <<: *node-env
      stages:
        - *install
        - name: build
          script: npm run build
  pull_request:
    - <<: *node-env
      stages:
        - *install
        - name: test
          script: npm test
```

---

## 2. 按功能拆分到 `.ci/` 目录

配置超过 150 行时，按「功能 + 触发事件」拆分。每个文件只做一件事，文件名即职责。

```
.cnb.yml                    # 仅 include 列表
.ci/
├── shared-config.yml       # 公共配置
├── docker-build.yml        # Docker 镜像构建
├── pr.yml                  # PR 检查
├── push-deploy.yml         # push 部署
├── tag-release.yml         # tag 发版
└── e2e-test.yml            # E2E 测试
```

每个文件末尾声明自己的分支触发，CNB include 自动合并。公共配置通过 `!reference` 跨文件引用。

---

## 3. 善用 `failStages` / `endStages` / `allowFailure`

```yaml
- name: build-and-deploy
  stages:
    - name: build
      script: npm run build
    - name: deploy
      script: ./deploy.sh
  failStages: # 仅失败时
    - name: notify-failure
      image: wecom-notify
      settings: { content: "失败: $CNB_BUILD_ID" }
  endStages: # 始终执行
    - name: cleanup
      script: rm -rf dist
```

---

## 4. 用 `cnb:await` / `cnb:resolve` 编排多 Pipeline

```yaml
main:
  push:
    build-frontend:
      stages:
        - name: build
          script: npm run build
        - name: resolve
          type: cnb:resolve
          options: { key: frontend-ready }

    deploy:
      stages:
        - name: await frontend
          type: cnb:await
          options: { key: frontend-ready }
        - name: deploy
          script: ./deploy.sh
```

---

## 5. 给 Pipeline 和 Stage 取有意义的名称

名称直接显示在构建界面。用「动词+名词」描述操作：`install-deps`、`run-unit-tests`、`deploy-to-staging`。
