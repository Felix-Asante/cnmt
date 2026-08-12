interface RequestProps {
  endpoint: string;
  method: RequestInit["method"];
  body?: any;
  headers?: RequestInit["headers"];
  cache?: RequestInit["cache"];
  next?: RequestInit["next"];
  json?: boolean;
}

export const request = async <T>({
  endpoint,
  method,
  body,
  headers,
  cache,
  next,
  json = true,
}: RequestProps): Promise<T> => {
  const requestBody = json ? JSON.stringify(body) : body;
  if (process.env.NODE_ENV === "development") {
    console.log("EP", endpoint);
  }

  const requestHeaders: any = {
    ...headers,
  };
  if (json) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(endpoint, {
    method,
    body: requestBody,
    headers: requestHeaders,
    cache,
    next,
  });
  const data = res?.json ? await res.json() : res;

  if (!res.ok) {
    throw data as Error;
  }
  return data as T;
};
