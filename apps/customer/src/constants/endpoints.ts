const BASE_URL = process.env.API_URL?.replace(/\/$/, "");

function createEndpoint(endpoint: string) {
  if (!BASE_URL) {
    throw new Error(
      "API_URL is not set. Add it in Vercel → Project Settings → Environment Variables (e.g. https://api.example.com/api/v1).",
    );
  }

  return `${BASE_URL}/${endpoint.replace(/^\//, "")}`;
}

export const API_ENDPOINTS = {
  paymentAccounts: {
    listByCountry: (countryId: string | number) =>
      createEndpoint(`countries/${countryId}/payment-accounts`),
  },
  transfers: {
    getTransferOptions: () => createEndpoint("transfers/options"),
    getByReference: (reference: string) =>
      createEndpoint(`transfers/${encodeURIComponent(reference)}`),
    create: () => createEndpoint("transfers"),
    createUploadPaymentProofSignedUrl: () =>
      createEndpoint("transfers/payment-proof/upload-url"),
    confirmPaymentProofUploaded: () =>
      createEndpoint("transfers/payment-proof/confirm"),
  },
};
