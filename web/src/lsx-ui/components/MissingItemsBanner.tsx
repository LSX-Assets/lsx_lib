// Yellow ⚠ warning banner shown at the top of any scriptConfig admin panel
// when one or more configured items aren't registered in the player's
// inventory items table.
//
// Driven by lsx_lib's `<scriptName>:getMissingItems` callback (server-side
// audit walks the schema's x-installItem / x-installItemList annotations,
// cross-references `lib.inventory.item(name)`, and returns the missing names
// + ready-to-paste install snippets keyed PER INVENTORY).
//
// The format picker is a dropdown (not a segmented control) so the growing
// list of supported inventories never bloats the UI. It defaults to the
// server's actual inventory (settings.inventory, from lsx_lib GET_SETTINGS).
//
// Auto-mounted by ConfigPanel above its tab AnimatePresence so it survives
// tab switches without remounting. Consumers can suppress it by passing
// `suppressMissingItemsBanner` to ConfigPanel.

import { alpha, Flex, Select, Text, useMantineTheme } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Check, Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { fetchNui } from "../utils/fetchNui";
import { useSettings } from "../utils/useSettings";

type MissingItem = {
  name: string;
  label?: string;
  weight?: number;
  description?: string;
};

// Snippets are keyed by inventory (ox_inventory, qb-inventory, …, esx).
type AuditPayload = {
  missing: MissingItem[];
  snippets: Record<string, string>;
};

type AuditResponse = {
  success: boolean;
  _error?: string;
  data?: AuditPayload;
};

// Display order + labels for the format dropdown. Keys match the lsx_lib
// installItems registry. Only keys actually present in the audit's snippets
// are shown, so this list can grow ahead of / behind the generator safely.
const INVENTORY_META: { key: string; label: string }[] = [
  { key: "ox_inventory", label: "ox_inventory" },
  { key: "bp_inventory", label: "bp_inventory" },
  { key: "qb-inventory", label: "qb-inventory" },
  { key: "qs-inventory", label: "qs-inventory" },
  { key: "codem-inventory", label: "codem-inventory" },
  { key: "tgiann-inventory", label: "tgiann-inventory" },
  { key: "one_inventory", label: "one_inventory" },
  { key: "ak47_inventory", label: "ak47_inventory" },
  { key: "core_inventory", label: "core_inventory" },
  { key: "devix-inventory", label: "devix-inventory" },
  { key: "esx", label: "ESX (legacy SQL)" },
];

// Module-level audit store. Persists across component re-mounts (ConfigPanel
// keys its tab content by activeTab, so each tab switch unmounts + remounts
// children). Stored data survives, fetch fires once per panel session.
type AuditStore = {
  data: AuditPayload | null;
  loaded: boolean;
  inFlight: boolean;
  refresh: () => Promise<void>;
};

export const useMissingItemsAudit = create<AuditStore>((set, get) => ({
  data: null,
  loaded: false,
  inFlight: false,
  refresh: async () => {
    if (get().inFlight) return;
    set({ inFlight: true });
    try {
      const res = await fetchNui<AuditResponse>("GET_MISSING_ITEMS", undefined, {
        success: true,
        data: { missing: [], snippets: {} },
      });
      if (res?.success && res.data) {
        set({ data: res.data, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    } finally {
      set({ inFlight: false });
    }
  },
}));

export function MissingItemsBanner() {
  const theme = useMantineTheme();
  const audit = useMissingItemsAudit((s) => s.data);
  const loaded = useMissingItemsAudit((s) => s.loaded);
  const inFlight = useMissingItemsAudit((s) => s.inFlight);
  const refresh = useMissingItemsAudit((s) => s.refresh);
  const serverInventory = useSettings((s) => s.inventory);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // First fetch — only when not yet loaded.
  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  // Dropdown options = the inventories the audit returned a snippet for, in
  // canonical order. Default to the server's own inventory when available.
  const options = useMemo(() => {
    const keys = audit ? Object.keys(audit.snippets) : [];
    return INVENTORY_META.filter((m) => keys.includes(m.key)).map((m) => ({ value: m.key, label: m.label }));
  }, [audit]);

  const defaultKey = useMemo(() => {
    if (serverInventory && options.some((o) => o.value === serverInventory)) return serverInventory;
    return options[0]?.value ?? null;
  }, [serverInventory, options]);

  const active = selected ?? defaultKey;

  const handleCopy = useCallback(() => {
    if (!audit || !active) return;
    const text = audit.snippets[active] ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [audit, active]);

  const handleRefresh = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    refresh();
  }, [refresh]);

  if (!audit || audit.missing.length === 0) return null;

  const warnColor = "#F5B83D"; // amber
  const names = audit.missing.map((m) => m.name);

  return (
    <div
      style={{
        background: alpha(warnColor, 0.06),
        border: `0.1vh solid ${alpha(warnColor, 0.35)}`,
        borderLeft: `0.3vh solid ${warnColor}`,
        borderRadius: theme.radius.xs,
        margin: "0.6vh 1vh",
        overflow: "hidden",
      }}
    >
      {/* Summary row */}
      <Flex align="center" gap="0.8vh" p="0.8vh 1vh" style={{ cursor: "pointer" }} onClick={() => setExpanded((e) => !e)}>
        <AlertTriangle size="1.8vh" color={warnColor} strokeWidth={2.5} />
        <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
          <Text ff="LSX Display" size="xs" tt="uppercase" lts="0.07em" c={warnColor}>
            {audit.missing.length === 1
              ? "1 item missing from your inventory"
              : `${audit.missing.length} items missing from your inventory`}
          </Text>
          <Text ff="LSX Display" size="xxs" c="rgba(255,255,255,0.5)" lineClamp={1} style={{ fontFamily: "monospace" }}>
            {names.join(", ")}
          </Text>
        </Flex>
        <button
          onClick={handleRefresh}
          disabled={inFlight}
          style={{
            background: "transparent", border: "none", padding: "0.3vh",
            cursor: inFlight ? "wait" : "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", opacity: inFlight ? 0.4 : 0.7,
          }}
          title="Re-check"
        >
          <motion.span
            animate={{ rotate: inFlight ? 360 : 0 }}
            transition={inFlight ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <RefreshCw size="1.5vh" color={alpha(warnColor, 0.7)} />
          </motion.span>
        </button>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronDown size="1.8vh" color={alpha(warnColor, 0.7)} />
        </motion.div>
      </Flex>

      {/* Expandable code view */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ overflow: "hidden", borderTop: `0.1vh solid ${alpha(warnColor, 0.18)}` }}
          >
            {/* Inventory-format picker */}
            <Flex align="center" gap="0.8vh" p="0.8vh 1vh" onClick={(e) => e.stopPropagation()}>
              <Text ff="LSX Display" size="xxs" tt="uppercase" lts="0.07em" c="rgba(255,255,255,0.5)" style={{ whiteSpace: "nowrap" }}>
                Your inventory
              </Text>
              <Select
                size="xs"
                data={options}
                value={active}
                onChange={(v) => { setSelected(v); setCopied(false); }}
                allowDeselect={false}
                comboboxProps={{ withinPortal: false }}
                style={{ flex: 1, maxWidth: "28vh" }}
                styles={{
                  input: {
                    background: alpha(warnColor, 0.06),
                    borderColor: alpha(warnColor, 0.35),
                    color: warnColor,
                    fontFamily: "LSX Display",
                  },
                }}
              />
            </Flex>

            <CodeView
              code={(active && audit.snippets[active]) || ""}
              copied={copied}
              onCopy={(e) => { e.stopPropagation(); handleCopy(); }}
              warnColor={warnColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeView({
  code,
  copied,
  onCopy,
  warnColor,
}: {
  code: string;
  copied: boolean;
  onCopy: (e: React.MouseEvent) => void;
  warnColor: string;
}) {
  const theme = useMantineTheme();
  const [hovered, setHovered] = useState(false);
  const lines = code === "" ? [""] : code.split("\n");
  const lineNumWidth = String(lines.length).length;

  const copyBg = copied
    ? alpha("#48E287", 0.15)
    : hovered
      ? alpha(warnColor, 0.18)
      : alpha(warnColor, 0.1);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute", top: "0.6vh", right: "0.8vh", zIndex: 2,
          background: copyBg,
          border: `0.1vh solid ${alpha(copied ? "#48E287" : warnColor, 0.35)}`,
          borderRadius: theme.radius.xs, padding: "0.4vh 0.7vh", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "0.4vh", transition: "background 0.12s",
        }}
      >
        {copied
          ? <Check size="1.4vh" color="#48E287" />
          : <Copy size="1.4vh" color={warnColor} />}
        <Text ff="LSX Display" size="xxs" tt="uppercase" lts="0.06em" c={copied ? "#48E287" : warnColor}>
          {copied ? "Copied" : "Copy"}
        </Text>
      </button>

      <div style={{
        background: alpha(theme.colors.dark[9], 0.6),
        maxHeight: "40vh", overflowY: "auto", overflowX: "auto", padding: "0.6vh 0",
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "monospace", fontSize: "1.2vh", lineHeight: 1.5 }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td style={{
                  width: `${lineNumWidth + 2}ch`, textAlign: "right",
                  padding: "0 0.8vh 0 1vh", color: "rgba(255,255,255,0.25)",
                  userSelect: "none", whiteSpace: "nowrap", verticalAlign: "top",
                }}>{i + 1}</td>
                <td style={{
                  padding: "0 1vh", color: "rgba(255,255,255,0.85)",
                  whiteSpace: "pre", verticalAlign: "top",
                }}>{line || "​"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
