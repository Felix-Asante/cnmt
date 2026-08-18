import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/components/pagination";
import { compactTransfersSearch, type TransfersSearch } from "./search";

export function TransferPagination({
  search,
  page,
  limit,
  total,
}: {
  search: TransfersSearch;
  page: number;
  limit: number;
  total: number;
}) {
  const navigate = useNavigate();

  function goTo(nextPage: number) {
    void navigate({
      to: "/dashboard/transfers",
      search: compactTransfersSearch({ ...search, page: nextPage }),
    });
  }

  return (
    <Pagination
      page={page}
      limit={limit}
      total={total}
      emptyLabel="No transfers"
      onPageChange={goTo}
    />
  );
}
