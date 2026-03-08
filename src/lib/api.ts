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
