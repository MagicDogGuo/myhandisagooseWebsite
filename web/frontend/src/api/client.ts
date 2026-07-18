export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function safeParseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await safeParseBody(res));
  }

  return res.json() as Promise<T>;
}
