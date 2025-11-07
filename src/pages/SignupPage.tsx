import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({ email, password, name: name || undefined });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 whitespace-nowrap">
            インセプションデッキをつくろう
          </h2>
          <p className="text-gray-600">
            アカウントを作成
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  名前（任意）
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-gray-900"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-gray-900"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード（6文字以上）
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-gray-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'アカウント作成中...' : 'アカウント作成'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">既にアカウントをお持ちの方は </span>
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline underline-offset-2 transition-colors duration-200"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
