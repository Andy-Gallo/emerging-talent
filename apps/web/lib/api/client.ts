const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:4000";

const normalizeBaseUrl = (value: string) =>
  value.endsWith("/api/v1") ? value : `${value.replace(/\/$/, "")}/api/v1`;

const API_BASE_URL = normalizeBaseUrl(rawBaseUrl);

export type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export { API_BASE_URL };
