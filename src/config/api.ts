export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_PHONE

export function getAuthToken(): string | null {
  return localStorage.getItem("mikeco_token")
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL no está configurado")
  }

  // ⚠️ Vercel requiere HTTPS
  const base =
    API_BASE_URL.startsWith("http") ? API_BASE_URL : `https://${API_BASE_URL}`

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`

  const headers = new Headers(options.headers)

  // No forzar JSON si es FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  // Auth header
  if (options.auth) {
    const token = getAuthToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
    credentials: "omit",
  })

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`

    try {
      const data = await res.json()
      message = data?.error ?? data?.message ?? message
    } catch (err) {
      // backend puede devolver texto plano o HTML (Vercel / 404)
    }

    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  // 🔥 Vercel a veces responde vacío
  const text = await res.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
