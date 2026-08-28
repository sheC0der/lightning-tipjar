import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
});

const TOKEN_KEY = "tipjar_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    return data?.error?.message ?? err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}
