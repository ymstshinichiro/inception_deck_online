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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-end items-center">
          <button
            onClick={handleCreateDeck}
            disabled={creating}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {creating ? '作成中...' : '+ 新規デッキ作成'}
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block bg-gray-100 text-gray-600 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6">
              📋
            </div>
            <p className="text-gray-600 mb-6 text-lg">まだデッキがありません</p>
            <button
              onClick={handleCreateDeck}
              className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              最初のデッキを作成
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 transition-all duration-200 hover:-translate-y-1 border border-gray-200"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {deck.title}
                </h3>
                {deck.description && (
                  <p className="text-sm text-gray-600 mb-4">{deck.description}</p>
                )}
                <div className="text-xs text-gray-500 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(deck.updated_at || deck.updatedAt || '').toLocaleDateString('ja-JP')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/decks/${deck.id}/edit`)}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => navigate(`/decks/${deck.id}/present`)}
                    className="flex-1 border-2 border-gray-700 hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    表示
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
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
