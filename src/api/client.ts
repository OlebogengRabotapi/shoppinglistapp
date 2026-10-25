import { API_URL } from '../constants';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/** Thin typed wrapper around fetch for json-server. */
export const request = async <T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure json-server is running on port 3001.');
  }
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};
