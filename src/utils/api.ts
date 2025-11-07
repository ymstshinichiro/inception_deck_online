const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // 認証
  signup: (data: { email: string; password: string; name?: string }) =>
    fetchApi<{ token: string; user: any }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<{ user: any }>('/api/auth/me'),

  // デッキ
  getDecks: () => fetchApi<{ decks: any[] }>('/api/decks'),

  getDeck: (id: number | string) => fetchApi<{ deck: any }>(`/api/decks/${id}`),

  createDeck: (data: { title: string; description?: string }) =>
    fetchApi<{ deck: any }>('/api/decks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDeck: (id: number | string, data: { title?: string; description?: string }) =>
    fetchApi<{ deck: any }>(`/api/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDeck: (id: number | string) =>
    fetchApi<{ message: string }>(`/api/decks/${id}`, {
      method: 'DELETE',
    }),

  // アイテム
  getItems: (deckId: number | string) =>
    fetchApi<{ items: any[] }>(`/api/decks/${deckId}/items`),

  getItem: (deckId: number | string, itemNumber: number) =>
    fetchApi<{ item: any }>(`/api/decks/${deckId}/items/${itemNumber}`),

  updateItem: (deckId: number | string, itemNumber: number, data: { content: string | null }) =>
    fetchApi<{ item: any }>(`/api/decks/${deckId}/items/${itemNumber}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
