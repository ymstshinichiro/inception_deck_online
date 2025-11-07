import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const items = new Hono<{ Bindings: Bindings }>();

// デッキの全アイテム取得
items.get('/:deckId/items', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');

    // デッキの所有者確認
    const deck = await c.env.DB.prepare(
      'SELECT id FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first();

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // アイテムを取得
    const result = await c.env.DB.prepare(
      'SELECT id, deck_id, item_number, content, created_at, updated_at FROM deck_items WHERE deck_id = ? ORDER BY item_number'
    ).bind(deckId).all();

    return c.json({ items: result.results });
  } catch (error) {
    console.error('Get items error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 特定のアイテム取得
items.get('/:deckId/items/:itemNumber', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    const itemNumber = c.req.param('itemNumber');

    // デッキの所有者確認
    const deck = await c.env.DB.prepare(
      'SELECT id FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first();

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // アイテムを取得
    const item = await c.env.DB.prepare(
      'SELECT id, deck_id, item_number, content, created_at, updated_at FROM deck_items WHERE deck_id = ? AND item_number = ?'
    ).bind(deckId, itemNumber).first();

    if (!item) {
      return c.json({ error: 'Item not found', item: null }, 404);
    }

    return c.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// アイテム更新または作成（Upsert）
items.put('/:deckId/items/:itemNumber', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    const itemNumber = parseInt(c.req.param('itemNumber'));
    const { content } = await c.req.json();

    // item_numberは1-10の範囲
    if (itemNumber < 1 || itemNumber > 10) {
      return c.json({ error: 'Item number must be between 1 and 10' }, 400);
    }

    // デッキの所有者確認
    const deck = await c.env.DB.prepare(
      'SELECT id FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first();

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // 既存のアイテムをチェック
    const existingItem = await c.env.DB.prepare(
      'SELECT id FROM deck_items WHERE deck_id = ? AND item_number = ?'
    ).bind(deckId, itemNumber).first();

    if (existingItem) {
      // 更新
      await c.env.DB.prepare(
        'UPDATE deck_items SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE deck_id = ? AND item_number = ?'
      ).bind(content || null, deckId, itemNumber).run();
    } else {
      // 作成
      await c.env.DB.prepare(
        'INSERT INTO deck_items (deck_id, item_number, content) VALUES (?, ?, ?)'
      ).bind(deckId, itemNumber, content || null).run();
    }

    // デッキのupdated_atも更新
    await c.env.DB.prepare(
      'UPDATE inception_decks SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(deckId).run();

    return c.json({
      item: {
        deckId,
        itemNumber,
        content: content || null,
      },
    });
  } catch (error) {
    console.error('Update item error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default items;
