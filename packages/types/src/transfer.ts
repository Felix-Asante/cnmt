import type {
  TransferDestinationCountry,
  TransferSourceCountry,
} from "./countries";

export type TransferOptions = {
  sources: TransferSourceCountry[];

  destinations: TransferDestinationCountry[];
};
