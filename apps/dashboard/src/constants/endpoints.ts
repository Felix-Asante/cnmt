const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

function createEndpoint(path: string) {
  const origin = BASE_URL.replace(/\/$/, "");
  return `${origin}/${path.replace(/^\//, "")}`;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export const API_ENDPOINTS = {
  transfers: {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      reference?: string;
      sender_phone?: string;
      recipient_phone?: string;
    }) => createEndpoint(`transfers${toQuery(params)}`),
    getByReference: (reference: string) =>
      createEndpoint(`transfers/${encodeURIComponent(reference)}`),
    verifyPayment: (id: string) =>
      createEndpoint(`admin/transfers/${id}/verify-payment`),
    rejectPayment: (id: string) =>
      createEndpoint(`admin/transfers/${id}/reject-payment`),
    process: (id: string) => createEndpoint(`admin/transfers/${id}/process`),
    complete: (id: string) => createEndpoint(`admin/transfers/${id}/complete`),
    cancel: (id: string) => createEndpoint(`admin/transfers/${id}/cancel`),
  },
};
