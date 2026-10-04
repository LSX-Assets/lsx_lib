import { create } from "zustand";
import { registerInitialFetch } from "./fetchNui";

export type InventoryItem = {
  name: string;
  label: string;
  weight: number;
  image: string;
  /** Optional inventory item description (e.g. ox_inventory Items[name].description). */
  description?: string;
};

export type InventoryItems = Record<string, InventoryItem>;

export const useItems = create<InventoryItems>(() => ({}));

export const useItemsList = (excludeItemNames: string[] = []): InventoryItem[] => {
  const excludeSet = new Set(excludeItemNames);
  return Object.values(useItems.getState()).filter((item) => !excludeSet.has(item.name));
};

export const getItemImageUrl = (itemName: string): string => {
  return useItems.getState()[itemName]?.image || "";
};

/**
 * Resolve an item's DISPLAY label from the shared inventory map, so a script can
 * source names from the player's inventory (translate once, there) instead of a
 * separately-stored label. Resolution order: inventory label -> fallback (e.g.
 * the script's own stored label) -> the raw item name.
 * Pass the map from `useItems()` so it re-resolves when items hydrate/change.
 */
export const resolveItemLabel = (items: InventoryItems, name: string, fallback?: string): string =>
  items[name]?.label || fallback || name;

/**
 * Resolve an item's DISPLAY description from the shared inventory map. Order:
 * inventory description -> fallback (script's stored description) -> "".
 */
export const resolveItemDescription = (items: InventoryItems, name: string, fallback?: string): string =>
  items[name]?.description || fallback || "";

registerInitialFetch<InventoryItems>("FETCH_ALL_ITEMS", null, {
  item1: { name: "item1", label: "Item 1", weight: 0.5, image: "item1.png" },
  item2: { name: "item2", label: "Item 2", weight: 1.0, image: "item2.png" },
  item3: { name: "item3", label: "Item 3", weight: 2.5, image: "item3.png" },
}).then((fetchedItems) => {
  if (!fetchedItems) return;
  useItems.setState(fetchedItems);
}).catch(() => {});
