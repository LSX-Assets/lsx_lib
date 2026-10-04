import { create } from "zustand";
import { fetchNui } from "./fetchNui";

// A shared-vehicle entry, normalised from the framework's vehicles.lua
// (qb-core array / qbx_core map) on the lsx_lib side. QB/QBX only — ESX has
// no categorised shared-vehicle table, so the list comes back empty there.
export type Vehicle = {
  model: string;
  name: string;
  brand?: string;
  price?: number;
  category?: string;
};

type VehiclesStore = {
  vehicles: Vehicle[];
  categories: string[];
  loaded: boolean;
};

export const useVehicles = create<VehiclesStore>(() => ({
  vehicles: [],
  categories: [],
  loaded: false,
}));

// Lazy fetch — only fires when a vehicle/category picker actually mounts
// (VehicleSelect / CategorySelect call ensureVehicles() in an effect), mirroring
// ensureFrameworkGroups. Singleton guard collapses concurrent mounts to one
// round-trip; reset on failure so a later mount can retry.
let requested = false;
export function ensureVehicles(): void {
  if (requested) return;
  requested = true;
  fetchNui<Vehicle[]>("GET_VEHICLES", undefined)
    .then((data) => {
      const vehicles = Array.isArray(data) ? data : [];
      const categories = Array.from(
        new Set(vehicles.map((v) => v.category).filter(Boolean) as string[]),
      ).sort();
      useVehicles.setState({ vehicles, categories, loaded: true });
    })
    .catch(() => {
      requested = false;
      useVehicles.setState({ loaded: true });
    });
}
