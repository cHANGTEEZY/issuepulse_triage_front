import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3000/api";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retryCount?: number;
  }
}

export interface ValidationErrors {
  [field: string]: string[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly validationErrors: ValidationErrors | null;
  readonly originalError: AxiosError;

  constructor(
    message: string,
    status: number,
    code: string,
    validationErrors: ValidationErrors | null,
    originalError: AxiosError,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isUnauthorized() {
    return this.status === 401;
  }
  isForbidden() {
    return this.status === 403;
  }
  isNotFound() {
    return this.status === 404;
  }
  isConflict() {
    return this.status === 409;
  }
  isValidation() {
    return this.status === 422;
  }
  isServerError() {
    return this.status >= 500;
  }
  isTimeout() {
    return this.code === "TIMEOUT";
  }
  isNetwork() {
    return this.code === "NETWORK_ERROR";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRYABLE_METHODS = new Set(["get", "head", "options"]);

function isRetryable(error: AxiosError, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false;
  if (!RETRYABLE_METHODS.has((error.config?.method ?? "get").toLowerCase()))
    return false;
  if (!error.response) return true;
  const { status } = error.response;
  return status === 429 || (status >= 500 && status !== 501);
}

function retryDelay(attempt: number, error: AxiosError): number {
  const retryAfterHeader = error.response?.headers["retry-after"];
  if (retryAfterHeader) return Number(retryAfterHeader) * 1_000;
  return RETRY_BASE_DELAY_MS * 2 ** attempt + Math.random() * 100;
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as Record<string, unknown> | undefined;

  let message: string;
  let code: string;
  let validationErrors: ValidationErrors | null = null;

  if (!error.response) {
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ERR_CANCELED";
    message = isTimeout
      ? "Request timed out. Please try again."
      : "Network error. Please check your connection.";
    code = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";
  } else {
    const nested = data?.error;
    if (nested && typeof nested === "object" && "message" in nested) {
      const record = nested as { message?: unknown; code?: unknown };
      message = String(record.message ?? "An unexpected error occurred");
      code = String(record.code ?? `HTTP_${status}`);
    } else {
      message = String(
        data?.message ??
          data?.error ??
          error.message ??
          "An unexpected error occurred",
      );
      code = String(data?.code ?? `HTTP_${status}`);
    }
    validationErrors = (data?.errors as ValidationErrors) ?? null;
  }

  return new ApiError(message, status, code, validationErrors, error);
}

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config._retryCount ??= 0;
    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    if (!config) return Promise.reject(normalizeError(error));

    if (error.response?.status === 401) {
      const normalized = normalizeError(error);
      if (isBrowser() && normalized.code !== "GITHUB_RECONNECT") {
        window.dispatchEvent(new CustomEvent("api:unauthorized"));
      }
      return Promise.reject(normalized);
    }

    const attempt = config._retryCount ?? 0;
    if (isRetryable(error, attempt)) {
      config._retryCount = attempt + 1;
      await sleep(retryDelay(attempt, error));
      return httpClient(config);
    }

    return Promise.reject(normalizeError(error));
  },
);

export type RequestConfig = Omit<AxiosRequestConfig, "url" | "method">;

async function get<T>(url: string, config?: RequestConfig): Promise<T> {
  const res = await httpClient.get<T>(url, config);
  return res.data;
}

async function post<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const res = await httpClient.post<T>(url, data, config);
  return res.data;
}

async function put<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const res = await httpClient.put<T>(url, data, config);
  return res.data;
}

async function patch<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const res = await httpClient.patch<T>(url, data, config);
  return res.data;
}

async function del<T = void>(url: string, config?: RequestConfig): Promise<T> {
  const res = await httpClient.delete<T>(url, config);
  return res.data;
}

async function upload<T>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
  config?: RequestConfig,
): Promise<T> {
  const res = await httpClient.post<T>(url, formData, {
    ...config,
    headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return res.data;
}

function cancellable<T>(url: string, config?: RequestConfig) {
  const controller = new AbortController();
  const request = get<T>(url, { ...config, signal: controller.signal });
  const cancel = (reason?: string) => controller.abort(reason);
  return { request, cancel };
}

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  cancellable,
  instance: httpClient,
} as const;
