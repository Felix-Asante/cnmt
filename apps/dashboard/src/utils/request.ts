export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  endpoint: string;
  method?: RequestInit["method"];
  body?: unknown;
  headers?: HeadersInit;
};

function readErrorMessage(data: unknown, status: number) {
  if (
    data !== null &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string" &&
    data.error.trim()
  ) {
    return data.error;
  }

  return `Request failed (${status})`;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function request<T>({
  endpoint,
  method = "GET",
  body,
  headers,
}: RequestOptions): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(readErrorMessage(data, res.status), res.status);
  }

  return data as T;
}
