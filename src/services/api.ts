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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('Unable to reach WhatChat. Check your connection and try again.', 0);
  }

  let body: { message?: string; code?: string } = {};
  if (response.headers.get('content-type')?.includes('application/json')) {
    body = await response.json().catch(() => ({})) as typeof body;
  }
  if (!response.ok) {
    const message = response.status === 502 || response.status === 503 || response.status === 504
      ? 'The WhatChat service is unavailable. Make sure the backend is running and try again.'
      : body.message ?? 'Something went wrong. Please try again.';
    throw new ApiError(
      message,
      response.status,
      body.code,
    );
  }
  return body as T;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  about: string | null;
  createdAt: string;
  profileComplete: boolean;
}
