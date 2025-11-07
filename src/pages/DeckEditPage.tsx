import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import type { Deck, DeckItem } from '../types/index';
import { INCEPTION_DECK_ITEMS } from '../types/index';

export default function DeckEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentItem, setCurrentItem] = useState(1);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    loadDeck();
  }, [id]);

  useEffect(() => {
    // 現在のアイテムが変わったら内容を更新
    if (deck?.items) {
      const item = deck.items.find((i) => (i.item_number || i.itemNumber) === currentItem);
      setContent(item?.content || '');
    }
  }, [currentItem, deck]);

  const loadDeck = async () => {
    if (!id) return;
    try {
      const response = await api.getDeck(id);
      setDeck(response.deck);
      // 最初のアイテムの内容を設定
      const firstItem = response.deck.items?.find((i: DeckItem) => (i.item_number || i.itemNumber) === 1);
      setContent(firstItem?.content || '');
    } catch (error) {
      console.error('Failed to load deck:', error);
      alert('デッキの読み込みに失敗しました');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateItem(id, currentItem, { content });
      // デッキを再読み込み
      await loadDeck();
      alert('保存しました');
    } catch (error: any) {
      alert('保存に失敗しました: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentItem > 1) {
      setCurrentItem(currentItem - 1);
    }
  };

  const handleNext = () => {
    if (currentItem < 10) {
      setCurrentItem(currentItem + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  const itemInfo = INCEPTION_DECK_ITEMS[currentItem - 1];
  const itemsMap = new Map(
    deck.items?.map((item) => [(item.item_number || item.itemNumber)!, item])
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 block">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {showHelp ? 'ヘルプを隠す' : 'ヘルプを表示'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              to={`/decks/${id}/present`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              プレビュー
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* 左サイドバー */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">10の質問</h2>
              <nav className="space-y-1">
                {INCEPTION_DECK_ITEMS.map((item) => {
                  const hasContent = itemsMap.has(item.number) && itemsMap.get(item.number)?.content;
                  return (
                    <button
                      key={item.number}
                      onClick={() => setCurrentItem(item.number)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        currentItem === item.number
                          ? 'bg-indigo-100 text-indigo-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{item.number}.</span>
                        <span className="flex-1">{item.title}</span>
                        {hasContent && <span className="text-green-600">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* メインエリア */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">
                    質問 {currentItem} / 10
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {itemInfo.title}
                  </h2>
                  <p className="text-gray-600">{itemInfo.description}</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    回答
                  </label>
                  <textarea
                    id="content"
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="こちらに回答を入力してください..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentItem === 1}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 前の質問
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentItem === 10}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次の質問 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右ヘルプサイドバー */}
          {showHelp && (
            <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                ガイド
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-900">
                  {itemInfo.guide}
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 text-gray-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                具体例
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {itemInfo.example}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
