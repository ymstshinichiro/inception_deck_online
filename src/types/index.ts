export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Deck {
  id: number;
  userId?: number;
  title: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  items?: DeckItem[];
}

export interface DeckItem {
  id?: number;
  deckId?: number | string;
  deck_id?: number;
  itemNumber?: number;
  item_number?: number;
  content: string | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateDeckData {
  title: string;
  description?: string;
}

export interface UpdateDeckData {
  title?: string;
  description?: string;
}

export interface UpdateItemData {
  content: string | null;
}

// インセプションデッキの10項目
export const INCEPTION_DECK_ITEMS = [
  {
    number: 1,
    title: '我々はなぜここにいるのか',
    description: 'Why are we here?',
    guide: 'プロジェクトを始める理由や目的を明確にしましょう。なぜこのプロジェクトが必要なのか、何を達成したいのかを書き出してください。',
    example: '例: 顧客が手作業で行っている在庫管理を自動化し、ミスを減らして業務効率を3倍にするため。競合他社に先駆けて市場に参入し、業界標準を確立するため。'
  },
  {
    number: 2,
    title: 'エレベーターピッチ',
    description: 'Elevator Pitch',
    guide: '30秒でプロジェクトを説明できるピッチを作成しましょう。誰のために、何を、どのような価値を提供するのかを簡潔に表現してください。',
    example: '例: 中小企業の経営者向けに、クラウド型在庫管理システムを提供します。リアルタイムで在庫を把握でき、発注ミスを90%削減し、月額5,000円から利用できます。既存の会計ソフトとも連携可能です。'
  },
  {
    number: 3,
    title: 'パッケージデザイン',
    description: 'Product Box',
    guide: 'プロダクトが商品パッケージになったと想像してください。キャッチコピー、主要機能、なぜ買うべきかを書き出しましょう。',
    example: '例:\n【キャッチコピー】在庫管理を、もっとシンプルに\n【主要機能】・リアルタイム在庫追跡 ・自動発注アラート ・スマホ対応 ・CSV一括登録\n【なぜ買うべきか】初期費用ゼロ、導入後すぐ使える、サポート充実'
  },
  {
    number: 4,
    title: 'やらないことリスト',
    description: 'NOT List',
    guide: 'スコープを明確にするため、意図的にやらないことを決めましょう。何を含めないか、どこまでやらないかを書き出してください。',
    example: '例:\n・会計機能は含めない（既存システムとの連携のみ）\n・モバイルアプリは作らない（ブラウザ版のみ）\n・多言語対応は後回し（まず日本語のみ）\n・大企業向けカスタマイズは対応しない'
  },
  {
    number: 5,
    title: 'プロジェクトコミュニティ',
    description: 'Meet the Neighbors',
    guide: 'プロジェクトに関わる人々や組織を洗い出しましょう。ステークホルダー、ユーザー、協力者、競合など、周辺の関係者を整理してください。',
    example: '例:\n【ユーザー】中小企業の経営者、在庫担当者\n【ステークホルダー】経営陣、営業部門、カスタマーサポート\n【協力者】クラウドインフラ提供者、会計ソフト企業\n【競合】A社の在庫管理SaaS、B社のERPシステム'
  },
  {
    number: 6,
    title: '技術的な解決策の概要',
    description: 'Technical Solution',
    guide: 'アーキテクチャや技術スタックの概要を説明しましょう。どのような技術を使い、どう構築するのか、技術的な方針を記述してください。',
    example: '例:\n【フロントエンド】React + TypeScript\n【バックエンド】Node.js + Express\n【データベース】PostgreSQL\n【インフラ】AWS (EC2, RDS, S3)\n【認証】OAuth 2.0 + JWT\n【アーキテクチャ】RESTful API、マイクロサービス化は見送り'
  },
  {
    number: 7,
    title: '夜も眠れない問題',
    description: 'What Keeps Us Up at Night',
    guide: 'プロジェクトのリスクや懸念事項をリストアップしましょう。技術的課題、スケジュール、リソース、不確実性など、気がかりなことを書き出してください。',
    example: '例:\n・データ移行の複雑さとバグのリスク\n・セキュリティ要件を満たせるか\n・スケジュール遅延の可能性（3ヶ月→6ヶ月になるかも）\n・経験者が少なく技術的な課題が多い\n・競合他社の新機能リリースに先を越される可能性'
  },
  {
    number: 8,
    title: '期間を見極める',
    description: 'Size It Up',
    guide: 'プロジェクトの期間や規模感を見積もりましょう。どのくらいの期間で、どのようなマイルストーンを目指すかを整理してください。',
    example: '例:\n【全体期間】6ヶ月\n【フェーズ1】要件定義・設計（1ヶ月）\n【フェーズ2】MVP開発（2ヶ月）\n【フェーズ3】ベータテスト（1ヶ月）\n【フェーズ4】本番リリース・改善（2ヶ月）'
  },
  {
    number: 9,
    title: '何を諦めるのか',
    description: 'Trade-off Sliders',
    guide: 'スコープ、時間、予算、品質のバランスを考えましょう。何を優先し、何を妥協できるのか、トレードオフを明確にしてください。',
    example: '例:\n【最優先】品質とセキュリティ → 絶対に妥協しない\n【優先】スケジュール → できるだけ守る\n【妥協可】機能のスコープ → 一部は後回しOK\n【妥協可】予算 → 必要なら多少増額OK'
  },
  {
    number: 10,
    title: '何がどれだけ必要か',
    description: "What's Going to Give",
    guide: 'プロジェクトに必要なリソースを洗い出しましょう。人員、予算、時間、ツール、設備など、何がどれだけ必要かを具体的に書き出してください。',
    example: '例:\n【人員】フロントエンド2名、バックエンド2名、デザイナー1名、PM1名\n【予算】開発費500万円、インフラ費月10万円\n【期間】6ヶ月\n【ツール】GitHub、Figma、Slack、AWS\n【その他】テストサーバー、ステージング環境'
  },
];
