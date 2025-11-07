import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const decks = new Hono<{ Bindings: Bindings }>();

// デッキ一覧取得
decks.get('/', async (c) => {
  try {
    const userId = c.get('userId');

    const result = await c.env.DB.prepare(
      'SELECT id, title, description, created_at, updated_at FROM inception_decks WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(userId).all();

    return c.json({ decks: result.results });
  } catch (error) {
    console.error('Get decks error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// デッキ作成
decks.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description } = await c.req.json();

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO inception_decks (user_id, title, description) VALUES (?, ?, ?)'
    ).bind(userId, title, description || null).run();

    const deckId = result.meta.last_row_id;

    return c.json({
      deck: {
        id: deckId,
        title,
        description: description || null,
        userId,
      },
    }, 201);
  } catch (error) {
    console.error('Create deck error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// デッキ詳細取得
decks.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('id');

    const deck = await c.env.DB.prepare(
      'SELECT id, user_id, title, description, created_at, updated_at FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first() as any;

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // デッキのアイテムも取得
    const items = await c.env.DB.prepare(
      'SELECT id, item_number, content, created_at, updated_at FROM deck_items WHERE deck_id = ? ORDER BY item_number'
    ).bind(deckId).all();

    return c.json({
      deck: {
        id: deck.id,
        userId: deck.user_id,
        title: deck.title,
        description: deck.description,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
        items: items.results,
      },
    });
  } catch (error) {
    console.error('Get deck error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// デッキ更新
decks.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('id');
    const { title, description } = await c.req.json();

    // デッキの所有者確認
    const deck = await c.env.DB.prepare(
      'SELECT id FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first();

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    await c.env.DB.prepare(
      'UPDATE inception_decks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(title, description || null, deckId).run();

    return c.json({
      deck: {
        id: deckId,
        title,
        description: description || null,
      },
    });
  } catch (error) {
    console.error('Update deck error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// デッキ削除
decks.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('id');

    // デッキの所有者確認
    const deck = await c.env.DB.prepare(
      'SELECT id FROM inception_decks WHERE id = ? AND user_id = ?'
    ).bind(deckId, userId).first();

    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    // ON DELETE CASCADEによりアイテムも自動削除される
    await c.env.DB.prepare(
      'DELETE FROM inception_decks WHERE id = ?'
    ).bind(deckId).run();

    return c.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Delete deck error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default decks;
