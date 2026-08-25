import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { AdminPaymentChannel } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/utils/request";
import {
  createPaymentChannel,
  deletePaymentChannel,
  updatePaymentChannel,
} from "./api";
import {
  channelTypeLabel,
  toCreatePaymentChannelPayload,
  toUpdatePaymentChannelPayload,
  updatePaymentChannelSchema,
  type UpdatePaymentChannelValues,
} from "./schema";

export function CountryChannels({
  countryId,
  channels,
  onChanged,
}: {
  countryId: number;
  channels: AdminPaymentChannel[];
  onChanged: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<AdminPaymentChannel | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(name: string, task: () => Promise<unknown>, success: string) {
    if (isPending) return;
    setPendingAction(name);
    startTransition(async () => {
      try {
        await task();
        toast.success(success);
        setEditingId(null);
        setAdding(false);
        setDeleting(null);
        await onChanged();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-navy">Payment channels</h2>
          <p className="mt-1 text-sm text-muted">
            Banks and mobile money networks available for this country.
          </p>
        </div>
        {!adding ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Add channel
          </Button>
        ) : null}
      </div>

      {adding ? (
        <div className="border border-border p-4">
          <p className="mb-3 text-sm font-medium text-navy">New channel</p>
          <ChannelForm
            pending={pendingAction === "create"}
            submitLabel="Add channel"
            onCancel={() => setAdding(false)}
            onSubmit={(values) =>
              run(
                "create",
                () =>
                  createPaymentChannel(
                    countryId,
                    toCreatePaymentChannelPayload(values),
                  ),
                "Payment channel added.",
              )
            }
          />
        </div>
      ) : null}

      {channels.length === 0 && !adding ? (
        <div className="border border-border px-4 py-10 text-center">
          <p className="text-sm text-muted">No payment channels yet.</p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            disabled={isPending}
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" aria-hidden />
            Add channel
          </Button>
        </div>
      ) : channels.length > 0 ? (
        <ul className="divide-y divide-border border border-border">
          {channels.map((channel) => (
            <li key={channel.id} className="p-4">
              {editingId === channel.id ? (
                <ChannelForm
                  defaultValues={{
                    name: channel.name,
                    channel_type: channel.channel_type,
                  }}
                  pending={pendingAction === `edit:${channel.id}`}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(values) =>
                    run(
                      `edit:${channel.id}`,
                      () =>
                        updatePaymentChannel(
                          channel.id,
                          toUpdatePaymentChannelPayload(values),
                        ),
                      "Payment channel updated.",
                    )
                  }
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-navy">{channel.name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">
                        {channelTypeLabel(channel.channel_type)}
                      </Badge>
                      <Badge
                        variant={channel.is_active ? "success" : "neutral"}
                      >
                        {channel.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${channel.name}`}
                      disabled={isPending || adding}
                      onClick={() => {
                        setAdding(false);
                        setEditingId(channel.id);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${channel.name}`}
                      disabled={isPending || adding}
                      onClick={() => setDeleting(channel)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete payment channel"
          description={`${deleting.name} will no longer be available for new transfers. Existing transfers are not changed.`}
          confirmLabel="Delete channel"
          pending={pendingAction === `delete:${deleting.id}`}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            run(
              `delete:${deleting.id}`,
              () => deletePaymentChannel(deleting.id),
              "Payment channel deleted.",
            )
          }
        />
      ) : null}
    </section>
  );
}

function ChannelForm({
  defaultValues,
  pending,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaultValues?: UpdatePaymentChannelValues;
  pending: boolean;
  submitLabel: string;
  onSubmit: (values: UpdatePaymentChannelValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<UpdatePaymentChannelValues>({
    resolver: zodResolver(updatePaymentChannelSchema),
    defaultValues: defaultValues ?? {
      name: "",
      channel_type: "MOBILE_MONEY",
    },
    mode: "onTouched",
  });
  const errors = form.formState.errors;
  const formId = defaultValues ? "edit" : "create";

  return (
    <form
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Field
        label="Channel name"
        htmlFor={`channel-${formId}-name`}
        required
        error={errors.name?.message}
      >
        <Input
          {...form.register("name")}
          id={`channel-${formId}-name`}
          placeholder="e.g. MTN, Ecobank"
          autoComplete="off"
        />
      </Field>

      <Controller
        control={form.control}
        name="channel_type"
        render={({ field }) => (
          <Field
            label="Type"
            htmlFor={`channel-${formId}-type`}
            required
            error={errors.channel_type?.message}
          >
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`channel-${formId}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <div className="flex items-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
