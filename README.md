# BMC Viewer

Markdownファイルで作成されたビジネスモデルキャンバス（Business Model Canvas）を美しく表示するためのWebアプリケーションです。

## 🌟 特徴

- 📊 Markdownファイルからビジネスモデルキャンバスを表示
- 👁️ 読みやすいレイアウトでの可視化
- 📱 レスポンシブデザイン対応
- 🚀 高速な動作（Vite + React）
- 📝 Markdownファイルの構造に基づいた自動レンダリング

## 🔗 デモ

https://mitsugeek.github.io/bmc-viewer/

## 🛠️ 技術スタック

- **フロントエンド**: React 18
- **ビルドツール**: Vite
- **言語**: JavaScript/JSX
- **スタイリング**: CSS
- **デプロイ**: GitHub Pages

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/mitsugeek/bmc-viewer.git

# ディレクトリに移動
cd bmc-viewer

# 依存関係をインストール
npm install
```

## 🚀 開発

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

## 🏗️ ビルド

```bash
# プロダクション用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📚 ビジネスモデルキャンバスとは

ビジネスモデルキャンバス（BMC）は、事業の構造を9つのブロックで可視化するフレームワークです：

1. **顧客セグメント** - ターゲットとなる顧客層
2. **価値提案** - 顧客に提供する価値
3. **チャネル** - 顧客との接点
4. **顧客との関係** - 顧客との関係性
5. **収益の流れ** - 収益源
6. **キーリソース** - 重要な経営資源
7. **キー活動** - 重要な活動
8. **キーパートナー** - 重要なパートナー
9. **コスト構造** - コストの構造

## 🎯 使い方

### 1. Markdownファイルの準備
ビジネスモデルキャンバスの内容をMarkdown形式で作成します。

```markdown
# ビジネスモデルキャンバス

## キーパートナー
- パートナー1
- パートナー2

## キー活動
- 活動1
- 活動2

## 価値提案
- 価値1
- 価値2

## 顧客との関係
- 関係性1
- 関係性2

## 顧客セグメント
- セグメント1
- セグメント2

## キーリソース
- リソース1
- リソース2

## チャネル
- チャネル1
- チャネル2

## コスト構造
- コスト1
- コスト2

## 収益の流れ
- 収益1
- 収益2
```

### 2. ファイルの読み込み
アプリケーションでMarkdownファイルを読み込み、ビジネスモデルキャンバス形式で表示

### 3. 編集について
- **表示のみ**: このアプリでは直接編集はできません
- **編集方法**: Markdownファイルをテキストエディタで直接編集してください
- **反映**: 編集後、ファイルを再読み込みすると変更が反映されます

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👤 作者

**mitsugeek**

- GitHub: [@mitsugeek](https://github.com/mitsugeek)

## 🙏 謝辞

- [Business Model Canvas](https://www.strategyzer.com/canvas/business-model-canvas) by Strategyzer
- [Vite](https://vitejs.dev/) - 高速なビルドツール
- [React](https://reactjs.org/) - ユーザーインターフェースライブラリ

---

⭐ このプロジェクトが役に立った場合は、スターを付けていただけると嬉しいです！