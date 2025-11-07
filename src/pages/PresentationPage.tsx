import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import type { Deck, DeckItem } from '../types/index';
import { INCEPTION_DECK_ITEMS } from '../types/index';

export default function PresentationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [id]);

  useEffect(() => {
    // キーボードナビゲーション
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        navigate(`/decks/${id}/edit`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, id]);

  const loadDeck = async () => {
    if (!id) return;
    try {
      const response = await api.getDeck(id);
      setDeck(response.deck);
    } catch (error) {
      console.error('Failed to load deck:', error);
      alert('デッキの読み込みに失敗しました');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < 10) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>読み込み中...</div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  const itemsMap = new Map(
    deck.items?.map((item) => [(item.item_number || item.itemNumber)!, item])
  );

  // 印刷モード時は全スライドを表示
  if (printMode) {
    return (
      <div className="bg-white">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .page-break {
              page-break-after: always;
              page-break-inside: avoid;
            }
          }
        `}</style>

        {INCEPTION_DECK_ITEMS.map((item, index) => {
          const content = itemsMap.get(item.number)?.content || '';
          return (
            <div
              key={item.number}
              className={`min-h-screen bg-gray-900 text-white flex flex-col p-16 pt-12 ${
                index < INCEPTION_DECK_ITEMS.length - 1 ? 'page-break' : ''
              }`}
            >
              <div className="max-w-4xl w-full mx-auto">
                <div className="mb-16">
                  <div className="text-xs text-gray-500 mb-2">{item.description}</div>
                  <h1 className="text-2xl font-bold text-blue-900">{item.title}</h1>
                </div>

                <div className="bg-gray-800 rounded-lg p-8 min-h-[300px]">
                  {content ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-3xl font-bold text-black whitespace-pre-wrap leading-relaxed">{content}</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <p className="text-lg">この項目はまだ入力されていません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 通常モード
  const itemInfo = INCEPTION_DECK_ITEMS[currentSlide - 1];
  const currentContent = itemsMap.get(currentSlide)?.content || '';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* ヘッダー */}
      <header className="bg-gray-800 p-4 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link
              to={`/decks/${id}/edit`}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              ← 編集に戻る
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              PDF印刷
            </button>
            <div className="text-sm">
              {currentSlide} / 10
            </div>
          </div>
        </div>
      </header>

      {/* スライドコンテンツ */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-400 mb-4">{itemInfo.description}</div>
            <h1 className="text-4xl font-bold mb-8">{itemInfo.title}</h1>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 min-h-[300px]">
            {currentContent ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg whitespace-pre-wrap">{currentContent}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p>この項目はまだ入力されていません</p>
                <Link
                  to={`/decks/${id}/edit`}
                  className="text-indigo-400 hover:text-indigo-300 text-sm mt-4 inline-block"
                >
                  編集画面で入力する
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ナビゲーション */}
      <footer className="bg-gray-800 p-4 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 1}
            className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 前へ
          </button>

          {/* インジケーター */}
          <div className="flex gap-2">
            {INCEPTION_DECK_ITEMS.map((item) => (
              <button
                key={item.number}
                onClick={() => setCurrentSlide(item.number)}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === item.number ? 'bg-indigo-500' : 'bg-gray-600'
                }`}
                title={item.title}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === 10}
            className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            次へ →
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          ← → キーで移動 | Esc で編集画面に戻る
        </div>
      </footer>
    </div>
  );
}
