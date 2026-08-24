import { useTransition } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { AdminCountry } from "@repo/types";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { createCountry } from "./api";
import { CreateCountryForm } from "./form";
import { toCreateCountryPayload, type CreateCountryValues } from "./schema";

export function CountryCreate({ countries }: { countries: AdminCountry[] }) {
  const router = useRouter();
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const existingIsoCodes = countries.map((country) => country.iso_code);

  function goBack() {
    void navigate({ to: "/dashboard/countries" });
  }

  function handleCreate(values: CreateCountryValues) {
    startTransition(async () => {
      try {
        const created = await createCountry(toCreateCountryPayload(values));
        toast.success("Country created.");
        await router.invalidate();
        void navigate({
          to: "/dashboard/countries/$id",
          params: { id: String(created.id) },
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <DashboardPage
        title="Add country"
        description="Choose a country, then add the banks and mobile money networks customers can use."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link to="/dashboard/countries">Back to countries</Link>
          </Button>
        }
      >
        <div className="border border-border bg-background p-5">
          <CreateCountryForm
            existingIsoCodes={existingIsoCodes}
            pending={isPending}
            onCancel={goBack}
            onSubmit={handleCreate}
          />
        </div>
      </DashboardPage>
    </div>
  );
}

export function CountryCreateError() {
  return (
    <DashboardPage title="Add country">
      <div className="max-w-xl border border-border bg-background px-5 py-10 text-center">
        <p className="text-sm text-muted">Could not open the create form.</p>
        <Button size="sm" className="mt-4" asChild>
          <Link to="/dashboard/countries">Back to countries</Link>
        </Button>
      </div>
    </DashboardPage>
  );
}
