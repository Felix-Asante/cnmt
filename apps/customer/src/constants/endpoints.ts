const BASE_URL = process.env.API_URL;

const createEndpoint = (endpoint: string) => {
  return `${BASE_URL}/${endpoint}`;
};

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
