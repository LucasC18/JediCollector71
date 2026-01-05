export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_PHONE;

export function getAuthToken(): string | null {
  return localStorage.getItem("mikeco_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;

    try {
      const data = await res.json();
      message = data?.error ?? data?.message ?? message;
    } catch {
      throw new Error(message);
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
