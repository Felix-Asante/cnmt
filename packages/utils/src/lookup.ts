export type NamedItem = {
  id: string;
  name: string;
};

export function itemId<T extends Pick<NamedItem, "id">>(item?: T | null) {
  return item?.id ?? "";
}

export function itemName(items: NamedItem[], id?: string) {
  if (!id) return "";
  return items.find((item) => item.id === id)?.name ?? "";
}
