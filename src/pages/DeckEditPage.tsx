import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type AIReview } from '../utils/api';
import type { Deck, DeckItem } from '../types/index';
import { INCEPTION_DECK_ITEMS } from '../types/index';
import Toast from '../components/Toast';
import LoadingModal from '../components/LoadingModal';

export default function DeckEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentItem, setCurrentItem] = useState(1);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const aiReviewRef = useRef<HTMLDivElement>(null);

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

  // Cmd+S / Ctrl+S で保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, currentItem, id]);

  const loadDeck = async () => {
    if (!id) return;
    try {
      const response = await api.getDeck(id);
      setDeck(response.deck);
      // 最初のアイテムの内容を設定
      const firstItem = response.deck.items?.find((i: DeckItem) => (i.item_number || i.itemNumber) === 1);
      setContent(firstItem?.content || '');
      // 保存されているAIレビューを読み込む
      if (response.deck.aiReview) {
        setAiReview(response.deck.aiReview);
      }
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
      // 保存成功時はアラートなし
    } catch (error: any) {
      setToast({ message: '保存に失敗しました: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = async () => {
    if (currentItem > 1) {
      await handleSave();
      setCurrentItem(currentItem - 1);
    }
  };

  const handleNext = async () => {
    if (currentItem < 10) {
      await handleSave();
      setCurrentItem(currentItem + 1);
    }
  };

  const allItemsFilled = () => {
    if (!deck?.items) return false;
    const itemsMap = new Map(deck.items.map(item => [(item.item_number || item.itemNumber)!, item]));
    return INCEPTION_DECK_ITEMS.every(item => {
      const deckItem = itemsMap.get(item.number);
      return deckItem?.content && deckItem.content.trim() !== '';
    });
  };

  const handleAIReview = async () => {
    if (!id) return;
    setAiLoading(true);
    try {
      const response = await api.reviewDeck(id);
      setAiReview(response.review);
      // AIレビューが取得できたら、少し待ってからスクロール
      setTimeout(() => {
        aiReviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: any) {
      setToast({ message: 'AIレビューの取得に失敗しました: ' + error.message, type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-2 block font-medium">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              {showHelp ? 'ヘルプを隠す' : 'ヘルプを表示'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <Link
              to={`/decks/${id}/present`}
              className="border-2 border-gray-700 hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-6 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center"
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
            <div className="p-4">
              <h2 className="font-bold text-gray-900 mb-4">10の質問</h2>
              <nav className="space-y-2">
                {INCEPTION_DECK_ITEMS.map((item) => {
                  const hasContent = itemsMap.has(item.number) && itemsMap.get(item.number)?.content;
                  return (
                    <button
                      key={item.number}
                      onClick={() => setCurrentItem(item.number)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                        currentItem === item.number
                          ? 'bg-gray-800 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 font-bold">{item.number}.</span>
                        <span className="flex-1 text-xs">{item.title}</span>
                        {hasContent && <span className={currentItem === item.number ? 'text-green-300' : 'text-green-600'}>✓</span>}
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAIReview}
                  disabled={!allItemsFilled() || aiLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
                >
                  {aiLoading ? 'AIレビュー中...' : 'AIレビュー'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  全ての項目を埋めるとAIレビューが可能になります
                </p>
              </div>
            </div>
          </div>

          {/* メインエリア */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 font-semibold mb-2">
                    質問 {currentItem} / 10
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {itemInfo.title}
                  </h2>
                  <p className="text-gray-600 text-lg">{itemInfo.description}</p>
                </div>

                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-3">
                    あなたの回答
                  </label>
                  <textarea
                    id="content"
                    rows={20}
                    className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-gray-900 bg-white shadow-sm"
                    placeholder="こちらに回答を入力してください..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentItem === 1}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← 前の質問
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentItem === 10}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次の質問 →
                  </button>
                </div>

                {aiReview && (
                  <div ref={aiReviewRef} className="mt-8 space-y-6">
                    {/* 現在の質問に対するレビュー */}
                    {(() => {
                      const currentReview = aiReview.itemReviews.find(r => r.itemNumber === currentItem);
                      if (currentReview) {
                        return (
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                              </div>
                              この質問へのAIレビュー
                            </h3>
                            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm space-y-4">
                              <div>
                                <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  良い点
                                </h4>
                                <p className="text-sm text-gray-800 leading-relaxed pl-7">
                                  {currentReview.goodPoints}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  改善提案
                                </h4>
                                <p className="text-sm text-gray-800 leading-relaxed pl-7">
                                  {currentReview.improvements}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* 全体の総評 */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        全体の総評
                      </h3>
                      <div className="bg-white rounded-lg p-5 border border-purple-100 shadow-sm">
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                          {aiReview.overallReview}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右ヘルプサイドバー */}
          {showHelp && (
            <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                ガイド
              </h3>
              <div className="bg-slate-50 border-l-4 border-slate-300 rounded-lg p-5 mb-6">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {itemInfo.guide}
                </p>
              </div>

              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-stone-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                具体例
              </h3>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {itemInfo.example}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* AIレビューローディングモーダル */}
      {aiLoading && (
        <LoadingModal message="AIレビューを生成しています。処理に数分かかる場合があります..." />
      )}
    </div>
  );
}
