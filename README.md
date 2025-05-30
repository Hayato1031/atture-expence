# Expan - 経費・収入管理デスクトップアプリ

合同会社Atture向け経費・収入管理デスクトップアプリケーション

## 🚀 特徴

- **Electron + React + Material UI** を使用したモダンなデスクトップアプリ
- **ガラスモーフィズムデザイン** で美しいユーザーインターフェース
- **AI統合** による自動カテゴリ分類機能
- **ローカルデータベース** でセキュアなデータ管理
- **リアルタイム分析** とインタラクティブなチャート

## 📋 主な機能

### 💼 ユーザー・関係者管理
- ユーザープロファイルの登録・編集・削除
- 役割と部署の管理
- ユーザー別支出統計

### 💰 経費・収入登録
- 直感的な登録フォーム
- AI による自動カテゴリ分類
- レシート画像のアップロードと管理
- 立て替え申請機能

### 📊 分析・可視化
- リアルタイム財務ダッシュボード
- インタラクティブなチャート（円グラフ、棒グラフ、線グラフ）
- ユーザー別・部署別ランキング
- 高度なフィルタリング機能

### ⚙️ 設定・カスタマイズ
- ライト/ダークテーマ切り替え
- カスタムカラーテーマ
- カテゴリ管理
- ChatGPT API統合設定
- データインポート・エクスポート

## 🛠️ 技術スタック

- **フロントエンド**: React 18, Material-UI 5, Framer Motion
- **デスクトップ**: Electron 28
- **データベース**: Dexie.js (IndexedDB)
- **チャート**: Chart.js, react-chartjs-2
- **デザイン**: Glassmorphism, CSS-in-JS
- **ルーティング**: React Router DOM

## 📦 インストールと実行

### 必要な環境
- Node.js 16+ 
- npm または yarn

### セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（Electronデスクトップアプリとして）
npm start

# プロダクション用ビルド
npm run build

# Electronアプリのパッケージ化
npm run electron-build
```

### スクリプト説明
- `npm start` - 開発用Electronアプリの起動（推奨）
- `npm run react-start` - Reactのみの開発サーバー
- `npm run electron` - ビルド済みアプリでElectronを起動
- `npm run build` - プロダクション用ビルド
- `npm run electron-build` - Electronアプリのパッケージ化

## 🎨 デザインシステム

### ガラスモーフィズム
- 透明度とブラー効果を使用した美しいガラス風デザイン
- 滑らかなアニメーションとトランジション
- カスタムグラデーションとシャドウ効果

### カラーパレット
- **プライマリ**: グラデーション（紫 → 青）
- **セカンダリ**: グラデーション（ピンク → オレンジ）
- **成功**: グラデーション（緑 → 青緑）
- **警告**: グラデーション（オレンジ → 赤）

## 📁 プロジェクト構造

```
src/
├── components/           # 再利用可能なコンポーネント
│   ├── Analytics/       # 分析関連コンポーネント
│   ├── Layout/          # レイアウトコンポーネント
│   ├── Navigation/      # ナビゲーションコンポーネント
│   ├── Registration/    # 登録フォームコンポーネント
│   ├── Settings/        # 設定関連コンポーネント
│   ├── UserManagement/  # ユーザー管理コンポーネント
│   └── common/          # 共通コンポーネント
├── db/                  # データベース関連
│   └── services/        # データサービス層
├── hooks/               # カスタムフック
├── pages/               # ページコンポーネント
├── services/            # 外部サービス（AI等）
├── styles/              # スタイルファイル
└── theme/               # テーマ設定
```

## 🔐 セキュリティ

- ローカルデータベースによるデータ保護
- ChatGPT APIキーの安全な管理
- contextIsolation有効化によるセキュリティ強化
- nodeIntegration無効化

## 🌟 AI機能

### 自動カテゴリ分類
- 経費内容からのインテリジェントなカテゴリ提案
- ユーザーの選択から学習する適応型システム
- カスタムカテゴリの作成と管理

### 将来の拡張予定
- OCR による領収書テキスト抽出
- 支出パターン分析
- 予算提案機能

## 🔧 開発者向け情報

### 環境変数
- `ELECTRON_START_URL` - 開発時のElectronスタートURL
- `BROWSER=none` - ブラウザの自動起動を無効化

### ビルド設定
- `homepage: "./"` - 相対パスでの動作
- Electron Builder設定済み（macOS/Windows/Linux対応）

## 📄 ライセンス

MIT License - 詳細は LICENSE ファイルを参照

## 🤝 貢献

プルリクエストや Issue の報告を歓迎します。

---

**開発者**: Claude Code Assistant  
**バージョン**: 1.0.0  
**最終更新**: 2025年5月29日

## 🔧 環境別ビルド設定

### ローカル開発環境（コード署名あり）

macOSでローカルビルドする場合、Xcodeの開発証明書を使用してコード署名が行われます：

```bash
# ローカル環境用ビルド（コード署名あり）
npm run build:local:mac    # macOS
npm run build:local:win    # Windows  
npm run build:local:linux  # Linux
npm run build:local:all    # 全プラットフォーム
```

#### CI/CD環境（コード署名なし）

GitHub ActionsなどのCI環境では、コード署名を無効化してビルドします：

```bash
# CI環境用ビルド（コード署名なし）
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:all    # 全プラットフォーム
```

### 環境変数

- `CI=true`: CI環境での実行を示し、コード署名を無効化
- `CSC_IDENTITY_AUTO_DISCOVERY=false`: 証明書の自動検出を無効化

### macOSコード署名について

**ローカル環境**:
- Xcodeがインストールされている場合、自動的に開発証明書でコード署名
- `hardenedRuntime: true`が適用
- entitlementsファイルが使用される

**CI環境**:
- コード署名なしでビルド
- ユーザーは「開発元を確認できません」の警告を見る
- 右クリック→開くで実行可能

## 📄 リリース

GitHub Actionsによる自動リリースが設定されています：

```bash
# 新しいバージョンタグを作成してプッシュ
git tag v1.0.x
git push origin v1.0.x
```

## 📄 トラブルシューティング

### macOSで「アプリが変更されているか破損しています」エラー

CI環境でビルドされたmacOSアプリは署名されていないため、以下の手順で実行してください：

1. アプリを右クリック
2. 「開く」を選択
3. 警告ダイアログで「開く」をクリック

または、ターミナルで以下のコマンドを実行：

```bash
sudo spctl --master-disable
```