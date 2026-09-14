export interface ApiRequestOptions extends RequestInit {
  defaultErrorMessage?: string;
}

/**
 * Thin fetch wrapper used by every API call in the app.
 *
 * Authentication is now handled via an HttpOnly cookie that the browser sends
 * automatically — no token management needed in JS at all.
 * `credentials: "include"` ensures the cookie is sent on cross-origin
 * requests during local development (client :5173 → server :5000).
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { defaultErrorMessage = "Something went wrong. Please try again.", ...fetchOptions } = options;

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.message ?? defaultErrorMessage);
  }

  return data as T;
}
