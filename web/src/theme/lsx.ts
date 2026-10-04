import { alpha, type MantineTheme, type MantineThemeOverride } from '@mantine/core';

// ─────────────────────────────────────────────────────────────────────────────
//  LSX BRAND
//
//  From the LSX Assets brand tokens (lsx-site/_design/brand/tokens.json). Dark
//  first: the logo's letters are white, so everything sits on a deep green-black
//  ground. The five X colours run from teal (bottom-left of the mark) to volt
//  (its top-right tip).
// ─────────────────────────────────────────────────────────────────────────────
export const lsxBrand = {
  teal: '#039482',
  emerald: '#1FBA83',
  green: '#48E287',
  lime: '#A7F778',
  volt: '#F0FB63',

  surface: '#0A100E',
  surfaceRaised: '#111A17',
  surfaceOverlay: '#18231F',
  line: '#24332D',
  lineStrong: '#56695F',
  ink: '#F2F7F4',
  inkMuted: '#93A69D',
  onBrand: '#06221A',
  brandSoft: '#0F2E24',

  warning: '#F5B83D',
  danger: '#FF7A6B',
  info: '#7CC0FF',

  /** The X: thin slanted bars, progress fills, the top edge of a featured panel. */
  gradientX: 'linear-gradient(45deg, #039482 0%, #1FBA83 35%, #48E287 60%, #A7F778 85%, #F0FB63 100%)',
  /** Where the yellow tip would read as a warning. */
  gradientXShort: 'linear-gradient(45deg, #039482 0%, #48E287 100%)',

  /** A 45° cut on the top-left and bottom-right corners, like the S in the mark. */
  chamfer: (size: string) =>
    `polygon(${size} 0, 100% 0, 100% calc(100% - ${size}), calc(100% - ${size}) 100%, 0 100%, 0 ${size})`,

  links: {
    store: 'https://lsxassets.com',
    discord: 'https://discord.gg/SutFab8d7P',
    releases: 'https://github.com/LSX-Assets/lsx_lib/releases/latest',
  },
} as const;

/**
 * Light to dark around the brand green (shade 5): the X's gradient, teal at the
 * deep end. It ships as the default `customTheme` with `primaryColor: 'custom'`,
 * because dirk-cfx-react always registers a `custom` palette: a palette by any
 * other name would only exist in this NUI, and Mantine refuses to render a
 * primaryColor it has no palette for.
 */
export const lsxPalette = [
  '#EAFCF2', '#D2F8E3', '#ABF1CB', '#82EAB0', '#63E59B',
  '#48E287', '#1FBA83', '#12A882', '#039482', '#027A6B',
] as const;

/**
 * Mantine's dark ramp, tinted to the LSX surfaces. Index 9 is the page, 8 the
 * raised panel, 7 the overlay, 6 the hairline; 0-3 are text. The luminance of
 * each step stays close to Mantine's own so existing markup keeps its contrast.
 */
export const lsxDark = [
  '#DDE7E2', '#B5C4BC', '#93A69D', '#6A7D74', '#3E5047',
  '#34463E', '#24332D', '#18231F', '#111A17', '#0A100E',
] as const;

const label = {
  fontSize: 'var(--mantine-font-size-xs)',
  fontFamily: 'LSX Display',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const genericInputStyles = {
  styles: {
    label,
    error: { fontSize: 'var(--mantine-font-size-xs)', fontFamily: 'LSX Sans' },
    description: { fontSize: 'var(--mantine-font-size-xs)' },
    // The input surface lives in index.css, not here: a `styles` object is
    // inline, and inline beats Mantine's :focus-within rule, which would take
    // the focus ring off every input.
  },
};

/**
 * Handed to dirk-cfx-react's DirkProvider as `themeOverride`. Its theme is
 * spread under this one key by key, so `components` here replaces the kit's
 * whole set: everything it styled is restated below in LSX type. primaryColor
 * and primaryShade are left out on purpose; they come from the server's
 * settings.
 */
export const lsxThemeOverride: MantineThemeOverride = {
  // A brand-green fill takes dark text, never white.
  autoContrast: true,
  luminanceThreshold: 0.4,
  defaultRadius: 'xs',
  fontFamily: "'IBM Plex Sans', 'LSX Sans', system-ui, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'LSX Mono', ui-monospace, Menlo, monospace",
  headings: {
    fontFamily: "'Chakra Petch', 'LSX Display', sans-serif",
    fontWeight: '700',
  },

  // Square-cut: the mark has no curves, so neither does the UI. `sm` keeps the
  // 2px the site gives inputs; everything else is square.
  radius: {
    xxs: '0',
    xs: '0',
    sm: '0.2vh',
    md: '0',
    lg: '0',
    xl: '0',
    xxl: '0',
  },

  colors: {
    dark: [...lsxDark],
  },

  components: {
    Progress: {
      styles: {
        label,
        root: { backgroundColor: alpha(lsxBrand.lineStrong, 0.35) },
      },
    },

    Input: genericInputStyles,
    TextInput: genericInputStyles,
    NumberInput: genericInputStyles,
    Select: genericInputStyles,
    MultiSelect: genericInputStyles,
    Textarea: genericInputStyles,
    ColorInput: genericInputStyles,
    DateInput: genericInputStyles,

    // Buttons share the inputs' vh heights, so `size="xs"` lines up with a
    // TextInput of the same size.
    Button: {
      styles: { label },
      vars: (_theme: MantineTheme, props: { size?: string }) => {
        const heights: Record<string, string> = { xs: '4vh', sm: '4.5vh', md: '5vh', lg: '5.5vh', xl: '6vh' };
        return { root: { '--button-height': heights[props.size ?? 'sm'] ?? '4.5vh' } };
      },
    },

    Pill: {
      styles: (theme: MantineTheme) => ({
        root: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: alpha(lsxBrand.lineStrong, 0.3),
          height: 'fit-content',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'LSX Display',
          fontSize: '1.25vh',
          borderRadius: theme.defaultRadius,
          paddingBottom: '0.5vh',
          paddingTop: '0.5vh',
        },
      }),
    },

    Tooltip: {
      styles: () => ({
        tooltip: {
          background: alpha(lsxBrand.surfaceRaised, 0.97),
          border: `0.1vh solid ${lsxBrand.line}`,
          color: 'rgba(242,247,244,0.85)',
          fontFamily: 'LSX Sans Medium',
          fontSize: '1.3vh',
          lineHeight: 1.3,
          padding: '0.6vh 0.8vh',
        },
      }),
    },
  },
};
