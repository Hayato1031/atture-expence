# アイコン設定ガイド

このドキュメントでは、Electron アプリケーションのビルド時に必要なアイコンファイルの配置について説明します。

## 必要なアイコンファイル

### 1. アプリケーションアイコン

Electron アプリケーションでは、各プラットフォーム用に異なる形式のアイコンが必要です：

- **Windows**: `.ico` ファイル
- **macOS**: `.icns` ファイル
- **Linux**: `.png` ファイル

### 2. アイコンファイルの配置場所

プロジェクトのルートディレクトリに `assets` フォルダを作成し、以下のファイルを配置してください：

```
AttureExpence/
├── assets/
│   ├── icon.ico     # Windows用アイコン (最低256x256px推奨)
│   ├── icon.icns    # macOS用アイコン
│   └── icon.png     # Linux用アイコン (512x512px推奨)
├── public/
│   ├── favicon.ico  # ブラウザタブ用アイコン
│   └── logo192.png  # PWA用アイコン
│   └── logo512.png  # PWA用アイコン
└── ...
```

**重要**: `assets`フォルダは`build`フォルダと違い、ビルド時に上書きされないため、アイコンファイルが安全に保持されます。

### 3. アイコンサイズの推奨仕様

#### Windows (.ico)
- 16x16, 32x32, 48x48, 256x256 ピクセルを含む
- 256色以上推奨

#### macOS (.icns)
- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024 ピクセルを含む

#### Linux (.png)
- 512x512 ピクセル推奨

### 4. アイコンの作成方法

#### オンラインツール
1. **CloudConvert**: https://cloudconvert.com/
   - PNG から ICO/ICNS への変換が可能

2. **ICO Convert**: https://icoconvert.com/
   - PNG から ICO への変換専用

3. **Image2icon**: http://www.img2icnsapp.com/
   - macOS用、PNG から ICNS への変換

#### コマンドラインツール

**electron-icon-builder** を使用する場合：
```bash
npm install --save-dev electron-icon-builder
```

元画像（1024x1024px の PNG）を `assets/icon.png` として配置し、以下を実行：
```bash
npx electron-icon-builder --input=assets/icon.png --output=assets
```

### 5. package.json の設定

```json
{
  "build": {
    "appId": "com.atture.expence",
    "productName": "AttureExpence",
    "directories": {
      "output": "release"
    },
    "mac": {
      "icon": "assets/icon.icns",
      "category": "public.app-category.finance"
    },
    "win": {
      "icon": "assets/icon.ico"
    },
    "linux": {
      "icon": "assets/icon.png",
      "category": "Office"
    }
  }
}
```

### 6. ビルドコマンド

アイコンファイルを配置した後、以下のコマンドでビルドします：

```bash
# Windows用
npm run build:win

# macOS用
npm run build:mac

# Linux用
npm run build:linux

# 全プラットフォーム
npm run build:all
```

### 7. トラブルシューティング

#### アイコンが表示されない場合
1. ファイル名が正確か確認（大文字小文字に注意）
2. ファイル形式が正しいか確認
3. `node_modules` と `dist` フォルダを削除して再ビルド

#### macOS でアイコンが更新されない場合
```bash
# アイコンキャッシュをクリア
sudo rm -rf /Library/Caches/com.apple.iconservices.store
killall Dock
```

### 8. 追加のアイコン設定

#### メニューバーアイコン（macOS）
`build/` に以下を追加：
- `trayIcon.png` (16x16)
- `trayIcon@2x.png` (32x32)

#### 通知アイコン
`build/` に以下を追加：
- `notification.png` (256x256)

## ビルド状況

✅ **ビルド設定完了**: package.json の設定は正常に動作します
✅ **プレースホルダーアイコン作成済み**: 基本的なアイコンファイルが `assets/` に配置されています
✅ **ESLint警告修正済み**: 主要な未使用インポートエラーを修正済み

### ビルド結果の確認方法

```bash
# macOS用ビルド結果（releaseフォルダに出力）
release/AttureExpence-1.0.0-arm64.dmg        # インストーラー
release/AttureExpence-1.0.0-arm64-mac.zip    # ポータブル版
release/mac-arm64/AttureExpence.app/          # アプリケーション

# アプリケーションを直接実行
open release/mac-arm64/AttureExpence.app/

# 古いビルドファイルをクリーンアップ
npm run clean
```

### 現在の警告について

以下の警告は機能に影響しませんが、今後改善可能です：
- コード署名証明書がない警告（配布時に必要）
- いくつかのReact Hooks依存関係の警告
- 未使用のインポート（残り分）

## まとめ

1. **現在の状態**: ビルドは成功し、実行可能なアプリケーションが生成されています
2. **アイコンの改善**: `assets/` フォルダのプレースホルダーアイコンを高品質なものに置き換えてください
3. **ビルドコマンド**: `npm run build:mac`, `npm run build:win`, `npm run build:linux` が使用可能
4. **配布可能**: `release/` フォルダにDMGファイルとZIPファイルが出力され、ユーザーに配布可能な状態です

これらの手順に従うことで、各プラットフォームで適切なアイコンが表示され、プロフェッショナルなアプリケーションを配布できます。