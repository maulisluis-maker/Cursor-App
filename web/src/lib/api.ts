const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<{ token: string }>(`/auth/register`, { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string }>(`/auth/login`, { method: 'POST', body: JSON.stringify(data) }),
  me: (token: string) => request(`/members/me`, { headers: { Authorization: `Bearer ${token}` } }),
  adminList: (token: string, params: { q?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/members${suffix}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  transactions: (token: string, memberId: string, page = 1, pageSize = 10) =>
    request(`/members/${memberId}/transactions?page=${page}&pageSize=${pageSize}`, { headers: { Authorization: `Bearer ${token}` } }),
  adjustPoints: (token: string, memberId: string, delta: number, reason?: string) =>
    request(`/members/${memberId}/points`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ delta, reason }) })
};
