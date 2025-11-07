import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import type { Deck } from '../types/index';
import { INCEPTION_DECK_ITEMS } from '../types/index';

export default function PresentationPrintPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeck();
  }, [id]);

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

  useEffect(() => {
    // ページ読み込み後に自動的に印刷ダイアログを表示
    if (!loading && deck) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, deck]);

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

  const itemsMap = new Map(
    deck.items?.map((item) => [(item.item_number || item.itemNumber)!, item])
  );

  return (
    <div className="bg-white">
      {/* 印刷用スタイル */}
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
            className={`min-h-screen bg-gray-900 text-white flex items-center justify-center p-16 ${
              index < INCEPTION_DECK_ITEMS.length - 1 ? 'page-break' : ''
            }`}
          >
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <div className="text-sm text-gray-400 mb-4">{item.description}</div>
                <h1 className="text-5xl font-bold mb-8">{item.title}</h1>
              </div>

              <div className="bg-gray-800 rounded-lg p-8 min-h-[300px]">
                {content ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-xl whitespace-pre-wrap leading-relaxed">{content}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-lg">この項目はまだ入力されていません</p>
                  </div>
                )}
              </div>

              <div className="text-right mt-8 text-sm text-gray-500">
                {item.number} / 10
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
