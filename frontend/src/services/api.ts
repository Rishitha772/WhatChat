const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('whatchat_token') || sessionStorage.getItem('whatchat_token');
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('whatchat_token', token);
  sessionStorage.setItem('whatchat_token', token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('whatchat_token');
  sessionStorage.removeItem('whatchat_token');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('Unable to reach WhatChat. Check your connection and try again.', 0);
  }

  let body: { message?: string; code?: string; error?: string; token?: string } = {};
  if (response.headers.get('content-type')?.includes('application/json')) {
    body = (await response.json().catch(() => ({}))) as typeof body;
  }

  // Automatically persist session token if returned
  if (body && typeof body.token === 'string' && body.token) {
    setStoredToken(body.token);
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
    }
    const rawError = body.message ?? (typeof body.error === 'string' ? body.error : undefined);
    const message =
      response.status === 502 || response.status === 503 || response.status === 504
        ? 'The WhatChat service is unavailable. Make sure the backend is running and try again.'
        : rawError ??
          (response.status === 403
            ? 'Access was denied. Please verify your credentials or permissions.'
            : 'Something went wrong. Please try again.');
    throw new ApiError(message, response.status, body.code);
  }
  return body as T;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  about: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  profileComplete: boolean;
}
