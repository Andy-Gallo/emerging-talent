export type ApiResponse<T> = {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      ...init,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async post<T>(path: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      ...init,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return (await response.json()) as ApiResponse<T>;
  }
}
