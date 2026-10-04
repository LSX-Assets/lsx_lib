import { Autocomplete } from "@mantine/core";
import React, { useEffect } from "react";
import { useModels, loadModels } from "../utils/useModels";
import { locale } from "../utils/locales";

export type ModelSelectProps = {
  value?: string;
  onChange: (model: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  size?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** Max suggestions rendered in the dropdown at once (default 100). */
  limit?: number;
};

// Searchable GTA model-name picker. Backed by the ~54k model list, which
// lazy-loads on first mount (see loadModels) so it never bloats a UI that
// doesn't use it. Uses Autocomplete (not Select) so admins can pick a known
// model OR type a custom/addon one; Mantine only renders `limit` matches at a
// time so 54k options stay snappy.
export function ModelSelect({
  value,
  onChange,
  label,
  placeholder,
  size = "xs",
  disabled,
  style,
  limit = 100,
}: ModelSelectProps) {
  const models = useModels((s) => s.models);

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder ?? (locale("SearchModel") || "Search or type a model…")}
      size={size}
      disabled={disabled}
      style={style}
      data={models}
      value={value ?? ""}
      limit={limit}
      onChange={(v) => onChange(v)}
    />
  );
}
