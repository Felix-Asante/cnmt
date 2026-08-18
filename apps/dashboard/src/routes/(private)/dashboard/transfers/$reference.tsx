import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTransfer } from "@/sections/transfers/api";
import {
  TransferDetail,
  TransferDetailError,
  TransferDetailPending,
  TransferNotFound,
} from "@/sections/transfers/detail";
import { ApiError } from "@/utils/request";

export const Route = createFileRoute("/(private)/dashboard/transfers/$reference")(
  {
    loader: async ({ params }) => {
      try {
        return await getTransfer(params.reference);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          throw notFound();
        }
        throw error;
      }
    },
    component: Page,
    pendingComponent: Pending,
    errorComponent: TransferDetailError,
    notFoundComponent: TransferNotFound,
    pendingMs: 0,
  },
);

function Page() {
  const transfer = Route.useLoaderData();
  return <TransferDetail transfer={transfer} />;
}

function Pending() {
  const { reference } = Route.useParams();
  return <TransferDetailPending reference={reference} />;
}
