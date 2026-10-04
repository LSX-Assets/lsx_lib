import { MultiSelect, Select } from "@mantine/core";
import React, { useEffect } from "react";
import { useVehicles, ensureVehicles } from "../utils/useVehicles";
import { locale } from "../utils/locales";

// Single shared-vehicle picker (value/onChange are the raw model string). The
// list lazy-loads on mount (QB/QBX only — empty on ESX). Labels show
// "Name (model)". Falls back to keeping a custom value selectable.
export function VehicleSelect({
  value,
  onChange,
  label,
  size = "xs",
  disabled,
  style,
  limit = 100,
}: {
  value?: string;
  onChange: (model: string) => void;
  label?: React.ReactNode;
  size?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  limit?: number;
}) {
  const vehicles = useVehicles((s) => s.vehicles);
  useEffect(() => { ensureVehicles(); }, []);

  const data = vehicles.map((v) => ({ value: v.model, label: v.name ? `${v.name} (${v.model})` : v.model }));
  const extra = value && !vehicles.some((v) => v.model === value) ? [{ value, label: value }] : [];

  return (
    <Select
      label={label}
      size={size}
      disabled={disabled}
      style={style}
      placeholder={locale("SearchVehicle") || "Search a vehicle…"}
      data={[...extra, ...data]}
      value={value ?? null}
      searchable
      clearable
      limit={limit}
      onChange={(v) => onChange(v ?? "")}
    />
  );
}

// Multi-select of shared-vehicle categories (the GTA classes each vehicle is
// tagged with — compacts, sports, super, …). Options lazy-load on mount.
export function CategorySelect({
  value,
  onChange,
  label,
  size = "xs",
  disabled,
  style,
}: {
  value: string[];
  onChange: (categories: string[]) => void;
  label?: React.ReactNode;
  size?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const categories = useVehicles((s) => s.categories);
  useEffect(() => { ensureVehicles(); }, []);

  // Keep any already-selected category that isn't in the fetched list.
  const opts = Array.from(new Set([...(value ?? []), ...categories])).sort();

  return (
    <MultiSelect
      label={label}
      size={size}
      disabled={disabled}
      style={style}
      placeholder={locale("SelectCategories") || "Select categories…"}
      data={opts}
      value={value ?? []}
      searchable
      clearable
      onChange={onChange}
    />
  );
}
