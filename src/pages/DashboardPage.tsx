import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import type { Deck } from '../types/index';

export default function DashboardPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const response = await api.getDecks();
      setDecks(response.decks);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    const title = prompt('デッキのタイトルを入力してください:');
    if (!title) return;

    setCreating(true);
    try {
      const response = await api.createDeck({ title });
      navigate(`/decks/${response.deck.id}/edit`);
    } catch (error: any) {
      alert('デッキの作成に失敗しました: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDeck = async (id: number) => {
    if (!confirm('このデッキを削除しますか？')) return;

    try {
      await api.deleteDeck(id);
      setDecks(decks.filter((d) => d.id !== id));
    } catch (error: any) {
      alert('デッキの削除に失敗しました: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">インセプションデッキ</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">デッキ一覧</h2>
          <button
            onClick={handleCreateDeck}
            disabled={creating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? '作成中...' : '新規デッキ作成'}
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">デッキがありません</p>
            <button
              onClick={handleCreateDeck}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              最初のデッキを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-sm text-gray-600 mb-4">{deck.description}</p>
                )}
                <div className="text-xs text-gray-500 mb-4">
                  更新日: {new Date(deck.updated_at || deck.updatedAt || '').toLocaleDateString('ja-JP')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/decks/${deck.id}/edit`)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => navigate(`/decks/${deck.id}/present`)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    表示
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
