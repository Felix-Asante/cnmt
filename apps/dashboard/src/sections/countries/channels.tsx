import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
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
import { deletePaymentChannel, updatePaymentChannel } from "./api";
import {
  channelTypeLabel,
  toUpdatePaymentChannelPayload,
  updatePaymentChannelSchema,
  type UpdatePaymentChannelValues,
} from "./schema";

export function CountryChannels({
  channels,
  onChanged,
}: {
  channels: AdminPaymentChannel[];
  onChanged: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
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
      <div>
        <h2 className="text-sm font-semibold text-navy">Payment channels</h2>
        <p className="mt-1 text-sm text-muted">
          Edit or remove existing banks and mobile money networks. New channels
          can only be added when creating a country.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="border border-border px-4 py-10 text-center">
          <p className="text-sm text-muted">No payment channels yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {channels.map((channel) => (
            <li key={channel.id} className="p-4">
              {editingId === channel.id ? (
                <ChannelEditForm
                  channel={channel}
                  pending={pendingAction === `edit:${channel.id}`}
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
                      disabled={isPending}
                      onClick={() => setEditingId(channel.id)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${channel.name}`}
                      disabled={isPending}
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
      )}

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

function ChannelEditForm({
  channel,
  pending,
  onSubmit,
  onCancel,
}: {
  channel: AdminPaymentChannel;
  pending: boolean;
  onSubmit: (values: UpdatePaymentChannelValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<UpdatePaymentChannelValues>({
    resolver: zodResolver(updatePaymentChannelSchema),
    defaultValues: {
      name: channel.name,
      channel_type: channel.channel_type,
    },
    mode: "onTouched",
  });
  const errors = form.formState.errors;

  return (
    <form
      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Field
        label="Channel name"
        htmlFor={`channel-${channel.id}-name`}
        required
        error={errors.name?.message}
      >
        <Input
          {...form.register("name")}
          id={`channel-${channel.id}-name`}
          autoComplete="off"
        />
      </Field>

      <Controller
        control={form.control}
        name="channel_type"
        render={({ field }) => (
          <Field
            label="Type"
            htmlFor={`channel-${channel.id}-type`}
            required
            error={errors.channel_type?.message}
          >
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`channel-${channel.id}-type`}>
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
          Save
        </Button>
      </div>
    </form>
  );
}
