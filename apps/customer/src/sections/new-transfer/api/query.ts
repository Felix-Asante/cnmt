import { queryOptions } from "@tanstack/react-query";
import { getTransferOptions } from "./server";

export const QueryKeys = {
  getTransferOptions: () => ["transfer-options"],
};

export const getTransferOptionsQueryOptions = queryOptions({
  queryKey: QueryKeys.getTransferOptions(),
  queryFn: getTransferOptions,
  staleTime: 60 * 3, // 3min
  gcTime: 60 * 3, // 3min
});
