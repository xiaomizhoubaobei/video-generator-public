# <p align="center"> 🎬 AI 视频生成器 🚀✨</p>

<p align="center">AI视频生成器根据文本和图片，通过Luma、Runway gen-3、kling可灵、CogVideoX智谱等业内领先的视频大模型生成高质量的AI视频</p>

<p align="center"><strong><a href="README.md">中文</a></strong> | <a href="README_en.md">English</a> | <a href="README_ja.md">日本語</a></p>

AI视频生成器根据文本和图片，通过Luma、Runway gen-3、kling可灵、CogVideoX智谱等业内领先的视频大模型生成高质量的AI视频。你可以根据自己的需求进行修改和自行部署。

## 界面预览

选择视频模型，输入提示词并设置参数，一键生成高质量AI视频
![](docs/302_AI_Video_Generator_screenshot_01.png)

上传本地图片或AI生图，输入提示词并设置参数，即可生成高质量AI视频
![](docs/302_AI_Video_Generator_screenshot_02.png)

支持多种AI模型生成图片，一键将生成的图片用于AI视频创作
![](docs/302_AI_Video_Generator_screenshot_03.png)

## 项目特性

### 🧩 多模型支持

    可根据不同模型提供不同配置选项，包括镜头控制、视频特效

### 🎛️ 多模式选择

    提供文生视频和图生视频两种模式，可根据个人需求进行选择

### 🖼️ AI生图

    一键生成AI图片，并将其用于视频创作

### 📜 历史记录

    保存您的创作历史,记忆不丢失，随时随地都可以下载。

### 🌓 暗色模式

    随心切换，保护您的眼睛。

### 🌐 多语言与国际化支持

- 中文界面
- English Interface
- 日本語インターフェース

## 🚩 未来更新计划

- [ ] 新增更多视频模型

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: TailwindCSS
- **UI组件**: Radix UI
- **状态管理**: Jotai
- **表单处理**: React Hook Form
- **HTTP客户端**: ky
- **国际化**: next-intl
- **主题**: next-themes
- **代码规范**: ESLint, Prettier
- **提交规范**: Husky, Commitlint

## 开发&部署

1. 克隆项目

```bash
git clone https://github.com/302ai/302-video-generator-public
cd 302-video-generator-public
```

2. 安装依赖

```bash
yarn install
```

3. 环境配置

```bash
cp .env.example .env.local
```

根据需要修改 `.env.local` 中的环境变量。

4. 启动开发服务器

```bash
yarn dev
```

5. 构建生产版本

```bash
yarn build
yarn start
```


