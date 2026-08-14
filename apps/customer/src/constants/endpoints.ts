const BASE_URL = process.env.API_URL;

const createEndpoint = (endpoint: string) => {
  return `${BASE_URL}/${endpoint}`;
};

export const API_ENDPOINTS = {
  transfers: {
    getTransferOptions: () => createEndpoint("transfers/options"),
    create: () => createEndpoint("transfers"),
    createUploadPaymentProofSignedUrl: () =>
      createEndpoint("transfers/payment-proof/upload-url"),
    confirmPaymentProofUploaded: () =>
      createEndpoint("transfers/payment-proof/confirm"),
  },
};
