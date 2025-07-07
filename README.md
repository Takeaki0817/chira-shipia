# SmartRecipe - AI駆動型レシピ生成アプリ

冷蔵庫の在庫情報とスーパーのセール情報を組み合わせて、AIがパーソナライズされたレシピを提案するWebアプリケーションです。

## 🚀 主要機能

- **在庫管理**: 冷蔵庫の食材を消費期限付きで管理
- **セール情報取得**: OCR + AI による自動チラシ解析
- **AI レシピ生成**: Gemini 2.0 Flash による個人化レシピ提案
- **学習機能**: ユーザーの調理傾向とフィードバックの蓄積

## 🛠 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite (開発サーバー)
- Tailwind CSS
- React Query (状態管理)
- React Router 6
- Zustand

### バックエンド
- Node.js 20 + Express
- TypeScript
- Supabase (データベース・認証・ストレージ)
- Google Cloud Vision API (OCR)
- Google Gemini 2.0 Flash (AI処理)

### インフラ
- Docker & Docker Compose
- Vercel (フロントエンド)
- Railway (バックエンド)

## 📁 プロジェクト構造

```
smart-recipe/
├── apps/
│   ├── frontend/              # React アプリ
│   └── backend/               # Express API
├── packages/
│   ├── shared-types/          # 共通型定義
│   └── database-types/        # Supabase 型定義
├── database/
│   ├── migrations/            # データベースマイグレーション
│   └── seeds/                # シードデータ
├── docker-compose.yml
└── package.json
```

## 🔧 セットアップ

### 必要な環境
- Node.js 20+
- npm 10+
- Docker & Docker Compose (オプション)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd smart-recipe
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
# ルートディレクトリ
cp .env.example .env

# フロントエンド
cp apps/frontend/.env.example apps/frontend/.env
```

環境変数ファイルを編集して、以下の値を設定してください：

- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `GEMINI_API_KEY`: Google Gemini APIキー
- `GOOGLE_CLOUD_PROJECT_ID`: Google CloudプロジェクトID

### 4. データベースのセットアップ

Supabaseを使用する場合：

```bash
# Supabase CLIでローカル開発環境を起動
npx supabase start

# マイグレーションを実行
npx supabase db reset
```

### 5. 開発サーバーの起動

```bash
# 全サービスを同時に起動
npm run dev

# または個別に起動
npm run dev:frontend  # localhost:3000
npm run dev:backend   # localhost:3001
```

## 🐳 Docker を使用した開発

```bash
# 全サービスをDockerで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# サービスを停止
docker-compose down
```

## 📝 開発コマンド

```bash
# 開発サーバー
npm run dev                    # 全サービス起動
npm run dev:frontend          # フロントエンドのみ
npm run dev:backend           # バックエンドのみ

# ビルド
npm run build                 # 全プロジェクトビルド
npm run build:frontend        # フロントエンドビルド
npm run build:backend         # バックエンドビルド

# テスト
npm test                      # 全テスト実行
npm run test:unit             # 単体テスト
npm run test:integration      # 統合テスト

# コード品質
npm run lint                  # ESLint実行
npm run lint:fix              # ESLint自動修正
npm run format                # Prettier実行
npm run typecheck             # TypeScript型チェック

# データベース
npm run db:start              # Supabase起動
npm run db:stop               # Supabase停止
npm run db:reset              # データベースリセット
npm run db:studio             # Supabase Studio起動
npm run db:types              # TypeScript型生成
```

## 🔑 環境変数

### 必須の環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase匿名キー | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `GEMINI_API_KEY` | Google Gemini APIキー | `AIzaSyC...` |

### オプションの環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `PORT` | バックエンドポート | `3001` |
| `NODE_ENV` | 実行環境 | `development` |
| `LOG_LEVEL` | ログレベル | `info` |

## 📚 API ドキュメント

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/signin` - ログイン
- `POST /api/auth/signout` - ログアウト
- `GET /api/auth/me` - ユーザー情報取得

### 在庫管理
- `GET /api/inventory` - 在庫一覧取得
- `POST /api/inventory` - 在庫追加
- `PUT /api/inventory/:id` - 在庫更新
- `DELETE /api/inventory/:id` - 在庫削除
- `GET /api/inventory/expiring` - 期限切れ近商品取得

### セール情報
- `POST /api/sales/upload` - チラシアップロード
- `POST /api/sales/process` - OCR + AI 処理
- `GET /api/sales` - セール情報一覧
- `GET /api/sales/:id/status` - 処理状況確認
- `DELETE /api/sales/:id` - セール情報削除

### レシピ
- `POST /api/recipes/generate` - レシピ生成
- `GET /api/recipes` - レシピ一覧
- `GET /api/recipes/:id` - レシピ詳細
- `POST /api/recipes/:id/rating` - レシピ評価

## 🧪 テスト

```bash
# 全テスト実行
npm test

# 単体テスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage

# ウォッチモード
npm run test:watch
```

## 🚀 デプロイ

### Vercel (フロントエンド)

1. Vercelアカウントにログイン
2. プロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

### Railway (バックエンド)

1. Railwayアカウントにログイン
2. プロジェクトを作成
3. 環境変数を設定
4. GitHub連携でデプロイ

## 🤝 コントリビューション

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🆘 トラブルシューティング

### よくある問題

#### 1. Supabase接続エラー
```bash
# 環境変数を確認
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# ローカルSupabaseを再起動
npm run db:stop
npm run db:start
```

#### 2. ポートの競合
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

#### 3. 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

## 📞 サポート

質問や問題がある場合は、以下の方法でお問い合わせください：

- [Issues](https://github.com/your-repo/smart-recipe/issues) - バグレポートや機能要求
- [Discussions](https://github.com/your-repo/smart-recipe/discussions) - 一般的な質問や議論