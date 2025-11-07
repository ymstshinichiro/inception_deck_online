# インセプションデッキ作成サイト - プロジェクト実装指示書

## プロジェクト概要
書籍「アジャイルサムライ」に登場する「インセプションデッキ」を作成するためのWebアプリケーション。
Cloudflareの無料サービス（Pages, Workers, D1）を使用して実装する。

## ユーザーフロー
1. アカウント作成
2. ログイン
3. ダッシュボード（デッキ一覧）表示
4. 新規デッキ作成
5. 10個の質問項目を一つずつ作成（途中保存可能）
6. 完成したデッキをスライド形式で閲覧

## 技術スタック

### フロントエンド
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: React Context API または Zustand
- **HTTP Client**: fetch API
- **Deploy**: Cloudflare Pages

### バックエンド
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT (jose library)
- **Password**: bcryptjs

### 開発ツール
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Type Checking**: TypeScript

## プロジェクト構造

```
inception_deck_online/        # ルート = フロントエンド (Cloudflare Pages)
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   ├── pages/              # ページコンポーネント
│   ├── contexts/           # Context API
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   ├── types/              # TypeScript型定義
│   ├── App.tsx
│   └── main.tsx
├── public/
├── backend/                 # Cloudflare Workers
│   ├── src/
│   │   ├── routes/         # APIルート
│   │   ├── middleware/     # 認証など
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データモデル
│   │   ├── utils/          # ユーティリティ
│   │   └── index.ts        # エントリーポイント
│   ├── migrations/         # D1マイグレーション
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── package.json            # フロントエンド用
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── plan.md
└── README.md
```

## データベース設計

### テーブル定義

```sql
-- users テーブル
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- inception_decks テーブル
CREATE TABLE inception_decks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- deck_items テーブル
CREATE TABLE deck_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id INTEGER NOT NULL,
  item_number INTEGER NOT NULL, -- 1-10の質問番号
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES inception_decks(id) ON DELETE CASCADE,
  UNIQUE(deck_id, item_number)
);

-- インデックス
CREATE INDEX idx_inception_decks_user_id ON inception_decks(user_id);
CREATE INDEX idx_deck_items_deck_id ON deck_items(deck_id);
```

## インセプションデッキの10項目

1. **我々はなぜここにいるのか** (Why are we here?)
2. **エレベーターピッチ** (Elevator Pitch)
3. **パッケージデザイン** (Product Box)
4. **やらないことリスト** (NOT List)
5. **プロジェクトコミュニティ** (Meet the Neighbors)
6. **技術的な解決策の概要** (Technical Solution)
7. **夜も眠れない問題** (What Keeps Us Up at Night)
8. **期間を見極める** (Size It Up)
9. **何を諦めるのか** (Trade-off Sliders)
10. **何がどれだけ必要か** (What's Going to Give)

## API設計

### 認証エンドポイント
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### デッキエンドポイント
- `GET /api/decks` - デッキ一覧取得
- `POST /api/decks` - デッキ作成
- `GET /api/decks/:id` - デッキ詳細取得
- `PUT /api/decks/:id` - デッキ更新
- `DELETE /api/decks/:id` - デッキ削除

### アイテムエンドポイント
- `GET /api/decks/:deckId/items` - アイテム一覧取得
- `PUT /api/decks/:deckId/items/:itemNumber` - アイテム更新（新規作成も兼ねる）
- `GET /api/decks/:deckId/items/:itemNumber` - 特定アイテム取得

## フロントエンド画面設計

### 1. 認証画面 (`/login`, `/signup`)
- メールアドレスとパスワード入力
- バリデーション
- エラー表示

### 2. ダッシュボード (`/dashboard`)
- デッキ一覧をカード形式で表示
- 新規作成ボタン
- 各デッキの進捗状況（10項目中何項目完了か）
- 編集・削除アクション

### 3. デッキ編集画面 (`/decks/:id/edit`)
- サイドバー：10項目のナビゲーション（完了状態を表示）
- メインエリア：現在編集中の項目
- 前へ/次へボタン
- 自動保存または保存ボタン
- プレビューへのリンク

### 4. プレゼンテーション画面 (`/decks/:id/present`)
- フルスクリーン対応
- スライド形式で10項目を表示
- 左右キーまたはボタンでナビゲーション
- スライド番号表示（1/10など）
- 編集モードへのリンク

## 実装手順

### Phase 1: 環境セットアップ
1. プロジェクトディレクトリ作成
2. フロントエンド（Vite + React + TypeScript）初期化
3. バックエンド（Cloudflare Workers）初期化
4. D1データベース作成とマイグレーション実行
5. 必要なパッケージのインストール

### Phase 2: バックエンド実装
1. Honoのセットアップ
2. CORS設定
3. 認証ミドルウェア（JWT）実装
4. ユーザー認証API実装
5. デッキCRUD API実装
6. アイテムCRUD API実装
7. ローカルテスト

### Phase 3: フロントエンド実装
1. TailwindCSSセットアップ
2. React Routerセットアップ
3. 認証コンテキスト実装
4. ログイン/サインアップページ
5. ダッシュボードページ
6. デッキ編集ページ（10項目のフォーム）
7. プレゼンテーションページ
8. API連携

### Phase 4: デプロイ
1. Cloudflare Workersデプロイ
2. Cloudflare Pagesデプロイ
3. 環境変数設定
4. 動作確認

### Phase 5: 改善・機能追加（オプション）
1. エクスポート機能（PDF/Markdown）
2. テンプレート機能
3. 共有機能
4. ダークモード

## 重要な実装ポイント

### 認証
- パスワードはbcryptjsでハッシュ化
- JWTトークンをlocalStorageに保存
- トークンの有効期限設定（7日間など）
- 保護されたルートの実装

### セキュリティ
- CORS設定を適切に行う
- SQLインジェクション対策（プリペアドステートメント使用）
- XSS対策（React標準で対応済み）
- 入力バリデーション

### UX
- ローディング状態の表示
- エラーハンドリングとユーザーフィードバック
- 自動保存または明示的な保存ボタン
- レスポンシブデザイン

### パフォーマンス
- 遅延ローディング
- キャッシュ戦略
- 最適化されたビルド

## 開発コマンド

### フロントエンド
```bash
# ルートディレクトリで実行
npm install
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # プロダクションビルド
npm run preview      # ビルド結果のプレビュー
```

### バックエンド
```bash
cd backend
npm install
npx wrangler d1 create inception-deck-db  # DB作成
npx wrangler d1 migrations apply inception-deck-db --local  # ローカルマイグレーション
npx wrangler dev     # ローカル開発サーバー (http://localhost:8787)
npx wrangler deploy  # デプロイ
```

## 環境変数

### フロントエンド (.env)
```
VITE_API_URL=http://localhost:8787
```

### バックエンド (wrangler.toml)
```toml
name = "inception-deck-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
JWT_SECRET = "your-secret-key-change-in-production"

[[d1_databases]]
binding = "DB"
database_name = "inception-deck-db"
database_id = "your-database-id"
```

## テスト項目

### バックエンド
- [ ] ユーザー登録が正常に動作する
- [ ] ログインが正常に動作する
- [ ] 認証トークンが正しく発行される
- [ ] 保護されたエンドポイントにアクセスできる
- [ ] デッキのCRUD操作が正常に動作する
- [ ] アイテムの更新が正常に動作する

### フロントエンド
- [ ] ログイン/サインアップフォームが動作する
- [ ] ダッシュボードにデッキ一覧が表示される
- [ ] デッキの新規作成ができる
- [ ] 10項目の編集ができる
- [ ] プレゼンテーション画面が正常に表示される
- [ ] ナビゲーションが正常に動作する

## トラブルシューティング

### CORS エラー
- バックエンドのCORS設定を確認
- フロントエンドのAPI URLが正しいか確認

### 認証エラー
- JWTトークンが正しく保存されているか確認
- トークンの有効期限を確認
- Authorization ヘッダーが正しく送信されているか確認

### データベースエラー
- マイグレーションが実行されているか確認
- wrangler.tomlのDB設定が正しいか確認
- SQLクエリの構文を確認

## 参考リンク

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Hono](https://hono.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

## 次のステップ

この指示書を基に、以下の順序で実装を進めてください：

1. Phase 1の環境セットアップから開始
2. バックエンドを完成させてテスト
3. フロントエンドを実装
4. ローカルで動作確認
5. Cloudflareにデプロイ

質問や問題が発生した場合は、該当するセクションを参照してください。