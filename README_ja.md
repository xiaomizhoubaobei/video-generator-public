# <p align="center"> 🎬 AIビデオジェネレーター 🚀✨</p>

<p align="center">AIビデオジェネレーターは、テキストや画像に基づき、Luma、Runway gen-3、kling、CogVideoXなど業界最先端のビデオ生成AIモデルを活用して高品質なAI動画を生成します。</p>

<p align="center"><a href="README.md">中文</a> | <a href="README_en.md">English</a> | <strong><a href="README_ja.md">日本語</a></strong></p>

AIビデオジェネレーターは、テキストや画像に基づき、Luma、Runway gen-3、kling、CogVideoXなど業界最先端のビデオ生成AIモデルを活用して高品質なAI動画を生成します。ニーズに合わせてカスタマイズし、自身でデプロイすることもできます。

## インターフェースプレビュー

動画生成モデルを選択し、プロンプトを入力してパラメータを設定し、ワンクリックで高品質のAI動画を生成できます。
![](docs/302_AI_Video_Generator_jp_screenshot_01.png)

ローカル画像やAI生成画像をアップロードし、プロンプトを入力してパラメータを設定すれば、高品質のAI動画を生成できます。
![](docs/302_AI_Video_Generator_jp_screenshot_02.png)

複数のAIモデルによる画像生成をサポートし、生成した画像でそのままAI動画作成が可能です。
![](docs/302_AI_Video_Generator_jp_screenshot_03.png)

## プロジェクトの特徴

### 🧩 複数モデル対応

    モデルごとに異なる設定オプション（カメラコントロール、動画エフェクト等）を提供

### 🎛️ 複数モード選択

    テキストから動画、画像から動画の2つのモードを用途に応じて切り替え可能

### 🖼️ AI画像生成

    ワンクリックでAI画像を生成し、その画像を動画制作に活用

### 📜 履歴管理

    創作履歴を保存し、いつでもどこでもダウンロード可能。記録を失いません

### 🌓 ダークモード

    自由に切替可能で、目を保護

### 🌍 多言語サポート

- 中国語インターフェース
- 英語インターフェース
- 日本語インターフェース

## 🚩 今後のアップデート計画

- [ ] より多くの動画生成モデルの追加

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **UIコンポーネント**: Radix UI
- **状態管理**: Jotai
- **フォーム処理**: React Hook Form
- **HTTPクライアント**: ky
- **国際化**: next-intl
- **テーマ**: next-themes
- **コード規約**: ESLint, Prettier
- **コミット規約**: Husky, Commitlint

## 開発&デプロイ

1. プロジェクトのクローン

```bash
git clone https://github.com/302ai/302-video-generator-public
cd 302-video-generator-public
```

2. 依存関係のインストール

```bash
yarn install
```

3. 環境設定

```bash
cp .env.example .env.local
```

必要に応じて`.env.local`の環境変数を修正してください。

4. 開発サーバーの起動

```bash
yarn dev
```

5. プロダクションビルド

```bash
yarn build
yarn start
```


