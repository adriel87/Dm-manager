const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return (Array.isArray(data) ? data : data.data ?? data) as T;
  } catch {
    return null;
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        data: null,
        error: (data as { message?: string }).message ?? 'Error en la petición.',
      };
    }

    const data = await res.json();
    return { data: data as T, error: null };
  } catch {
    return { data: null, error: 'Error de red. Verifica tu conexión e inténtalo de nuevo.' };
  }
}

export async function apiPut<T>(
  path: string,
  body: unknown
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        data: null,
        error: (data as { message?: string }).message ?? 'Error en la petición.',
      };
    }

    const data = await res.json();
    return { data: data as T, error: null };
  } catch {
    return { data: null, error: 'Error de red. Verifica tu conexión e inténtalo de nuevo.' };
  }
}
