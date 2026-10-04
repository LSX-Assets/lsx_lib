import { type MantineThemeOverride } from "@mantine/core";
import baseTheme, { lsxDark } from "../theme";

// ─────────────────────────────────────────────────────────────────────────────
//  PANEL THEME
//
//  The scriptConfig admin panel is the one piece of UI that is IDENTICAL across
//  every LSX resource — an operator learns it once and then meets it again in
//  fishing, phone, multichar, example_cars. So it must not inherit its look from
//  whichever product it happens to be mounted inside.
//
//  It used to. Any consumer could restyle the shared panel just by passing a
//  `themeOverride` to LsxProvider for its own UI, and nobody would notice
//  because you never see two panels side by side. example_phone did exactly that:
//  it replaced `colors.dark` with Apple's grey ramp for its iOS look, and its
//  panel came out pure black and flat where fishing's is charcoal.
//
//  So the panel now re-asserts the library's own values for its subtree. A
//  consumer's theme still reaches everything else it owns; it just stops at the
//  panel's edge.
//
//  This travels through React context, which means it also applies to the
//  Modals the panel opens even though those render through a Portal — CSS
//  inheritance would not have reached them.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The keys a consumer can plausibly override that the panel's layout depends
 * on. Deliberately NOT the whole theme — a consumer's `primaryColor` and any
 * custom colour scales should still come through, because sections are allowed
 * to use the product's accent.
 */
export const panelTheme: MantineThemeOverride = {
  // Sections read theme.colors.dark[5/6/7/8/9] for row fills, dividers and
  // modal backdrops. The LSX ramp keeps Mantine's luminance steps, tinted to
  // the brand's green-black surfaces.
  colors: {
    dark: [...lsxDark],
  },

  // Type. The panel is sized in `vh` throughout, so it wants the library's vh
  // line-heights. A consumer whose own UI is sized in container units will
  // reasonably have swapped these for unitless ratios — correct for them,
  // wrong here.
  fontSizes: baseTheme.fontSizes,
  lineHeights: baseTheme.lineHeights,

};

/**
 * The same values again, as CSS custom properties.
 *
 * The theme object above is only half the job. Mantine emits its
 * `--mantine-font-size-*` / `--mantine-line-height-*` / `--mantine-color-*`
 * variables ONCE, at the root MantineProvider — a nested MantineThemeProvider
 * updates what `useMantineTheme()` returns but not those variables. So
 * `<Text size="xs">`, which resolves `var(--mantine-line-height-xs)`, keeps
 * getting the host's value. (Measured: the panel stayed on example_phone's 1.3
 * with the theme override alone in place.)
 *
 * Spreading this onto the panel's root element re-declares them for that
 * subtree, and custom properties inherit, so everything inside picks them up.
 */
export const panelCssVars: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(baseTheme.fontSizes ?? {}).map(([k, v]) => [`--mantine-font-size-${k}`, v as string]),
  ),
  ...Object.fromEntries(
    Object.entries(baseTheme.lineHeights ?? {}).map(([k, v]) => [`--mantine-line-height-${k}`, v as string]),
  ),
  ...Object.fromEntries(
    lsxDark.map((c, i) => [`--mantine-color-dark-${i}`, c]),
  ),
};

// A NOTE ON `Text: { defaultProps: { lh } }`
//
// A consumer that sets a global `lh` on Text defeats the lineHeights above,
// because a defaultProp is applied per element and beats the size-derived
// value. There is no way to unset it from here: Mantine's defaultProps merge
// drops `undefined`, so `Text: { defaultProps: { lh: undefined } }` leaves the
// consumer's value in place (measured, not assumed).
//
// So don't set one. Put the ratio in `lineHeights` instead — same result for
// the consumer, and it stays overridable here. example_phone was the case that
// found this.
