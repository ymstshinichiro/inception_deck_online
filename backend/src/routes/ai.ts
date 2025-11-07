import { Hono } from 'hono';
import type { Env } from '../index';

const ai = new Hono<{ Bindings: Env }>();

// AIレビューエンドポイント
ai.post('/review/:deckId', async (c) => {
  const deckId = c.req.param('deckId');

  // デッキと全アイテムを取得
  const deck = await c.env.DB.prepare(
    'SELECT * FROM inception_decks WHERE id = ?'
  ).bind(deckId).first();

  if (!deck) {
    return c.json({ error: 'Deck not found' }, 404);
  }

  // 全10項目を取得
  const items = await c.env.DB.prepare(
    'SELECT * FROM deck_items WHERE deck_id = ? ORDER BY item_number'
  ).bind(deckId).all();

  // 全項目が埋まっているかチェック
  const allItemsFilled = items.results?.length === 10 &&
    items.results.every((item: any) => item.content && item.content.trim() !== '');

  if (!allItemsFilled) {
    return c.json({ error: 'All 10 items must be filled' }, 400);
  }

  // インセプションデッキの質問定義
  const INCEPTION_DECK_ITEMS = [
    { number: 1, title: '我々はなぜここにいるのか', description: 'Why are we here?' },
    { number: 2, title: 'エレベーターピッチ', description: 'Elevator Pitch' },
    { number: 3, title: 'パッケージデザイン', description: 'Product Box' },
    { number: 4, title: 'やらないことリスト', description: 'NOT List' },
    { number: 5, title: '「ご近所さん」を探せ', description: 'Meet the Neighbors' },
    { number: 6, title: '解決案を描く', description: 'Show Solution' },
    { number: 7, title: '夜も眠れない問題', description: 'Up at Night' },
    { number: 8, title: '期間を見極める', description: 'Size It Up' },
    { number: 9, title: '何を諦めるか', description: 'Trade-off Sliders' },
    { number: 10, title: '何がどれだけ必要か', description: 'What\'s Going to Give' },
  ];

  // プロンプトを構築
  const itemsContent = items.results?.map((item: any) => {
    const itemDef = INCEPTION_DECK_ITEMS.find(i => i.number === item.item_number);
    return `## ${itemDef?.number}. ${itemDef?.title} (${itemDef?.description})
${item.content}`;
  }).join('\n\n');

  const systemPrompt = `あなたはアジャイル開発のエキスパートで、インセプションデッキのレビューを行います。

インセプションデッキは10の質問からなり、プロジェクトの目的や方向性を明確にするツールです。

レビューの観点：
1. 各項目間の一貫性（矛盾がないか）
2. 具体性（抽象的すぎないか）
3. 実現可能性（現実的か）
4. 網羅性（重要な観点が抜けていないか）

必ず以下のJSON形式で回答してください：
{
  "itemReviews": [
    {
      "itemNumber": 1,
      "goodPoints": "良い点の説明",
      "improvements": "改善提案"
    },
    ...
  ],
  "overallReview": "全体の総評"
}

回答は必ず有効なJSONのみとし、それ以外のテキストは含めないでください。
ビジネスライクで建設的なトーンで日本語で回答してください。`;

  const userPrompt = `以下のインセプションデッキをレビューしてください：

# プロジェクト: ${deck.title}

${itemsContent}

各質問について、良い点と改善できる点をレビューし、最後に全体の総評を提供してください。
必ずJSON形式で回答してください。`;

  try {
    // OpenAI APIを呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return c.json({
        error: 'AI service error',
        details: errorData
      }, 500);
    }

    const data = await response.json() as any;
    const reviewText = data.choices[0].message.content as string;

    console.log('AI Response:', reviewText);

    // JSONレスポンスをパース
    try {
      const reviewJson = JSON.parse(reviewText);
      console.log('Successfully parsed JSON:', reviewJson);
      return c.json({ review: reviewJson });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', reviewText);
      console.error('Parse error:', parseError);
      // JSONパースに失敗した場合は、テキストとして返す
      return c.json({ review: { overallReview: reviewText, itemReviews: [] } });
    }
  } catch (error) {
    console.error('AI review error:', error);
    return c.json({
      error: 'Failed to generate review',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default ai;
