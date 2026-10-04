import { alpha, Flex, Image, Text, useMantineTheme } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { isEnvBrowser, openLink } from 'dirk-cfx-react';
import { lsxBrand } from '../../theme/lsx';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChangelogModal } from './ChangelogPage';
import { useStudio } from './store';
import { filterAnnouncements, usePublicInfo } from './publicInfo';
import { useChrome } from './studioLocale';

/**
 * Announcements on the Overview page.
 *
 * There was no way to tell a server owner anything: they found out about a
 * release when they happened to check Discord, and about a sale once it was
 * over. Every one of them opens this panel, so this is the one surface
 * guaranteed to be seen.
 *
 * MOCK DATA FOR NOW. The shape below is the wire format, so when lsx_lib
 * starts fetching the real thing this file only loses its constant: entries
 * arrive already filtered - which server runs which script, who is behind on a
 * version, whether a promo has started - because targeting is resolved
 * server-side and a client is only ever handed what it should see.
 *
 * Nothing here renders markup from an entry. Titles and bodies are plain text
 * and the only thing an entry can draw is a card the panel designed, because
 * this is remote content in somebody else's admin panel.
 */

export type DispatchKind = 'update' | 'promo' | 'action' | 'tip' | 'notice';

export type DispatchEntry = {
  id: string;
  kind: DispatchKind;
  title: string;
  body?: string;
  /**
   * One thing to do about it.
   *
   * `url` leaves the game for a page; `changelog` names a resource and opens
   * its changelog right here. An announcement about a release is answering
   * "what changed", and the answer is already on this server - taking someone
   * out to a browser to read it would be daft.
   */
  action?: { label: string; url?: string; changelog?: string };
  /** date, version, countdown - whatever is worth stamping on it */
  stamp?: string;
  /** overrides the kind's own word on the chip, e.g. "20% off" */
  chip?: string;
  /** hosted artwork, cropped to a strip down the left */
  banner?: string;
  /** drawn art instead of an image: a small line over a big one */
  bannerKicker?: string;
  bannerWord?: string;
  /** above everything else */
  pin?: boolean;
  /**
   * Cannot be dismissed.
   *
   * For the one thing that should stay put - a launch, the current sale. Use
   * it sparingly: an announcement nobody can clear is a banner, and a panel
   * full of banners is an advert board.
   */
  featured?: boolean;
  /**
   * The script this is about, if it is about one.
   *
   * Lets the rail mark that script's What's new tab without opening it - the
   * only honest source for "there is a newer version", since a changelog
   * shipped inside a resource can never know about a release that came after
   * it.
   */
  resource?: string;
};

/** Stripe, chip colour, and the word on the chip. */
const KINDS: Record<DispatchKind, { color: string; label: string }> = {
  update: { color: '#48E287', label: 'Update' },
  promo: { color: '#A7F778', label: 'Promo' },
  action: { color: '#FF7A6B', label: 'Action needed' },
  tip: { color: '#7CC0FF', label: 'Tip' },
  notice: { color: '#93A69D', label: 'Notice' },
};

/**
 * The panel is sized in vh; the design these came from is in px at a 16px
 * base. Converted once, here, at a 1080p reference - 14.5px is 1.34vh - rather
 * than reached for through Mantine's own scale, which is a different scale
 * and came out noticeably larger than the design.
 */
const SIZE = {
  title: '1.35vh',
  body: '1.25vh',
  chip: '0.95vh',
  stamp: '1vh',
  button: '1.05vh',
  kicker: '0.9vh',
  word: '2.5vh',
};

/**
 * Stand-in content until the endpoint exists.
 *
 * Deliberately a realistic spread - a banner, an update, something urgent and
 * something quiet - so the page is judged on how it reads when there is
 * genuinely something to say, not on one tidy example.
 */
const MOCK: DispatchEntry[] = [
  {
    id: 'bench-bolingbroke',
    kind: 'promo',
    title: 'Bolingbroke, rebuilt',
    body: 'The prison, rebuilt from the ground up. Follow the build as it happens in our Discord.',
    action: { label: 'Follow on Discord', url: 'https://discord.gg/SutFab8d7P' },
    chip: 'In progress',
    banner: 'mock',
    bannerKicker: 'On the bench',
    bannerWord: 'BOLING\nBROKE',
    pin: true,
    featured: true,
  },
  {
    id: 'lsx-lib-100',
    kind: 'update',
    title: 'lsx_lib 1.0 is out',
    body: 'The shared library behind every LSX script: bridges for your framework, inventory and target, and this panel to set them all up.',
    action: { label: 'Read the changelog', changelog: 'lsx_lib' },
    stamp: '4 Oct',
    resource: 'lsx_lib',
  },
  {
    id: 'example-120',
    kind: 'action',
    title: 'example_script 1.2.0 needs a config change',
    body: 'A setting moved between sections. Worth reading before you upgrade.',
    stamp: "you're 3 versions behind",
    resource: 'example_script',
  },
  {
    id: 'studio-tip-items',
    kind: 'tip',
    title: "You can name an item that doesn't exist yet",
    body: 'Item pickers accept a name you have not installed and flag it amber, so you can configure gear before the next restart adds it.',
    stamp: 'Script Studio',
  },
];

/**
 * Which entries this person has dismissed.
 *
 * The viewer's own browser, not the server: we learn nothing by it and their
 * database gains no rows for someone clicking an X. Wrapped because storage
 * throws outright in some contexts rather than merely coming back empty.
 */
const DISMISSED_KEY = 'lsx.studio.dispatch.dismissed';

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissed(ids: string[]) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids.slice(-200)));
  } catch {
    // Storage blocked: the card simply comes back next time.
  }
}

/**
 * Scripts an undismissed announcement is about.
 *
 * Read by the rail to put a dot on that script's What's new tab. Falls back to
 * the mock spread in the browser for the same reason the page does.
 */
export function useAnnouncedResources(): Set<string> {
  const entries = usePublicFeed();
  return useMemo(() => {
    const source = entries?.length ? entries : (isEnvBrowser() ? MOCK : []);
    const out = new Set<string>();
    for (const entry of source) {
      if (entry.resource && (entry.kind === 'update' || entry.kind === 'action')) out.add(entry.resource);
    }
    return out;
  }, [entries]);
}

/**
 * The announcements this server should see.
 *
 * Fetched from the public repo by the panel itself and filtered against what
 * is actually installed - the feed is one file read by every server, so it
 * cannot know which scripts are running or what version they are on. That
 * matching only happens here.
 *
 * An empty result is a real answer - the feed genuinely has nothing to say -
 * and in game that is what gets shown. The sample spread below is design
 * scaffolding and appears in the browser only.
 */
function usePublicFeed(): DispatchEntry[] {
  const { data } = usePublicInfo();
  const scripts = useStudio((s) => s.scripts);

  return useMemo(() => {
    if (!data?.announcements?.length) return [];
    const installed: Record<string, string> = {};
    for (const script of scripts) installed[script.resource] = script.version;
    return filterAnnouncements(data.announcements, installed);
  }, [data, scripts]);
}

/** `empty` is shown instead of nothing when there is no news. */
export function Dispatch({ empty }: { empty?: React.ReactNode } = {}) {
  const t = useChrome();
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const [session, setSession] = useState<string[]>([]);
  /** which script's changelog is open over the page, if any */
  const [reading, setReading] = useState<string | null>(null);

  const entries = usePublicFeed();

  // Dismissing a REAL announcement is remembered for good. Dismissing a mock
  // one lasts the session: the stored list is not even consulted for them, so
  // an X clicked while this was being designed does not permanently hide the
  // sample content - which is exactly what it looked like had happened.
  // Only ever in the browser. In game an empty feed means there is genuinely
  // nothing to announce, and showing sample content there is worse than
  // showing nothing - it reads as a real announcement about a real product.
  const usingMock = isEnvBrowser() && !entries?.length;

  const shown = useMemo(() => {
    const source = usingMock ? MOCK : (entries ?? []);
    const hidden = usingMock ? session : dismissed;
    const all = source.filter((e) => !hidden.includes(e.id));
    const rank = (e: DispatchEntry) => (e.featured ? 2 : e.pin ? 1 : 0);
    return [...all].sort((a, b) => rank(b) - rank(a));
  }, [entries, usingMock, dismissed, session]);

  const dismiss = (id: string) => {
    if (usingMock) {
      setSession((prev) => [...prev, id]);
      return;
    }
    const next = [...dismissed, id];
    setDismissed(next);
    writeDismissed(next);
  };

  if (shown.length === 0) return <>{empty ?? null}</>;

  /**
   * Three at a time, and the next one steps up as you clear them.
   *
   * A carousel hid everything but one behind arrows nobody would press, and
   * the full stack needed a scrollbar on a laptop. A short queue shows what is
   * waiting without ever growing the page: dismiss one and the fourth appears.
   */
  const VISIBLE = 3;
  const visible = shown.slice(0, VISIBLE);
  const waiting = shown.length - visible.length;

  return (
    <Flex direction="column" gap="0.8vh" style={{ minHeight: 0 }}>
      {reading && <ChangelogModal resource={reading} onClose={() => setReading(null)} />}

      <AnimatePresence initial={false}>
        {visible.map((entry) => (
          <DispatchCard
            key={entry.id}
            entry={entry}
            onDismiss={() => dismiss(entry.id)}
            onReadChangelog={setReading}
          />
        ))}
      </AnimatePresence>

      {waiting > 0 && (
        <Text ff="LSX Sans Medium" c="rgba(255,255,255,0.28)" style={{ fontSize: SIZE.stamp }}>
          {t('dispatch.more', '{} more once you clear these').replace('{}', String(waiting))}
        </Text>
      )}
    </Flex>
  );
}

function DispatchCard({
  entry, onDismiss, onReadChangelog,
}: {
  entry: DispatchEntry;
  onDismiss: () => void;
  onReadChangelog: (resource: string) => void;
}) {
  const theme = useMantineTheme();
  const t = useChrome();
  const kind = KINDS[entry.kind] ?? KINDS.notice;
  const hasBanner = !!entry.banner;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: '-4%', height: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        display: 'grid',
        // The stripe is a column, not a border: it runs the full height of the
        // card, and artwork takes its place when there is any.
        gridTemplateColumns: hasBanner ? '19vh 1fr auto' : '0.28vh 1fr auto',
        columnGap: hasBanner ? 0 : '1.1vh',
        background: alpha(theme.colors.dark[8], 0.55),
        border: `0.1vh solid ${alpha(theme.colors.dark[5], 0.45)}`,
        borderRadius: theme.radius.xs,
        overflow: 'hidden',
      }}
    >
      {hasBanner
        ? <Banner entry={entry} />
        : <div style={{ background: kind.color }} />}

      <Flex
        direction="column"
        gap="0.45vh"
        style={{
          minWidth: 0,
          padding: hasBanner ? '1.2vh 1.4vh' : '1vh 0 1.1vh',
        }}
      >
        <Flex align="center" gap="0.75vh" wrap="wrap">
          <Text ff="LSX Display" c="rgba(255,255,255,0.9)" style={{ fontSize: SIZE.title }}>
            {entry.title}
          </Text>
          <Chip color={kind.color}>
            {entry.chip ?? t(`dispatch.kind.${entry.kind}`, kind.label)}
          </Chip>
        </Flex>

        {entry.body && (
          <Text
            ff="LSX Sans Medium"
            c="rgba(255,255,255,0.5)"
            style={{ fontSize: SIZE.body, lineHeight: 1.5, maxWidth: '62ch' }}
          >
            {entry.body}
          </Text>
        )}

        {(entry.action || entry.stamp) && (
          <Flex align="center" gap="0.95vh" wrap="wrap" style={{ marginTop: '0.28vh' }}>
            {entry.action && (() => {
              const style = {
                padding: '0.35vh 0.95vh',
                border: `0.1vh solid ${alpha(kind.color, 0.4)}`,
                borderRadius: theme.radius.xs,
                textDecoration: 'none',
                fontFamily: 'LSX Display',
                fontSize: SIZE.button,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: kind.color,
                lineHeight: 1.9,
                background: 'transparent',
                cursor: 'pointer',
              };

              // A changelog opens here; a link leaves for a browser.
              return entry.action.changelog ? (
                <motion.button
                  type="button"
                  onClick={() => onReadChangelog(entry.action!.changelog!)}
                  whileHover={{ background: alpha(kind.color, 0.16) }}
                  whileTap={{ scale: 0.97 }}
                  style={style}
                >
                  {entry.action.label}
                </motion.button>
              ) : (
                /* `openLink`, not an anchor.
                 *
                 * A CEF page has no browser to hand a target to - an <a> here
                 * either did nothing or tried to navigate the panel itself out
                 * of existence. The library's helper calls the game's own
                 * openLink native, which is what opens the player's actual
                 * browser, and falls back to window.open outside the game. */
                <motion.button
                  type="button"
                  onClick={() => openLink(entry.action!.url!)}
                  whileHover={{ background: alpha(kind.color, 0.16) }}
                  whileTap={{ scale: 0.97 }}
                  style={style}
                >
                  {entry.action.label}
                </motion.button>
              );
            })()}
            {entry.stamp && (
              <Text ff="monospace" c="rgba(255,255,255,0.3)" style={{ fontSize: SIZE.stamp }}>
                {entry.stamp}
              </Text>
            )}
          </Flex>
        )}
      </Flex>

      <Flex align="flex-start" style={{ padding: '0.95vh 1.1vh 0 0' }}>
        {entry.featured ? (
          // No X: this one stays. A disabled-looking button would only invite
          // clicking it.
          <div style={{ width: '1.85vh' }} />
        ) : (
        <motion.button
          type="button"
          onClick={onDismiss}
          whileHover={{ background: alpha(theme.colors.dark[4], 0.4) }}
          whileTap={{ scale: 0.92 }}
          title={t('dispatch.dismiss', 'Dismiss')}
          style={{
            width: '1.85vh', height: '1.85vh',
            display: 'grid', placeItems: 'center',
            background: 'transparent',
            border: `0.1vh solid ${alpha(theme.colors.dark[5], 0.7)}`,
            borderRadius: '0.3vh',
            cursor: 'pointer',
          }}
          aria-label={t('dispatch.dismiss', 'Dismiss')}
        >
          <X size="1.1vh" color="rgba(255,255,255,0.4)" />
        </motion.button>
        )}
      </Flex>
    </motion.div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        // Centred on its own text rather than sitting on a taller inherited
        // line box, which is what floated it above the title beside it.
        display: 'inline-flex',
        alignItems: 'center',
        background: alpha(color, 0.12),
        border: `0.1vh solid ${alpha(color, 0.35)}`,
        borderRadius: '0.3vh',
        padding: '0.15vh 0.55vh',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      <Text
        ff="LSX Display" tt="uppercase" c={color}
        style={{ fontSize: SIZE.chip, letterSpacing: '0.1em', lineHeight: 1 }}
      >
        {children}
      </Text>
    </div>
  );
}

/**
 * The artwork strip.
 *
 * A real entry names a hosted image; `mock` draws a stand-in so this can be
 * looked at before any art is uploaded. An image that fails to load falls back
 * to that same treatment rather than leaving a broken box in the panel.
 */
function Banner({ entry }: { entry: DispatchEntry }) {
  const theme = useMantineTheme();
  const [failed, setFailed] = useState(false);
  const accent = theme.colors[theme.primaryColor][5];
  const drawn = entry.banner === 'mock' || failed;

  if (!drawn) {
    return (
      <Image
        src={entry.banner}
        h="100%"
        fit="cover"
        onError={() => setFailed(true)}
        style={{ borderRight: `0.1vh solid ${alpha(theme.colors.dark[5], 0.45)}` }}
      />
    );
  }

  return (
    <Flex
      direction="column"
      justify="flex-end"
      gap="0.28vh"
      style={{
        position: 'relative',
        padding: '1.2vh',
        borderRight: `0.1vh solid ${alpha(theme.colors.dark[5], 0.45)}`,
        background: `radial-gradient(120% 90% at 12% 0%, ${alpha(accent, 0.3)}, transparent 62%),
          linear-gradient(150deg, #0F2E24 0%, #0A100E 60%, #111A17 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(130deg, ${alpha(accent, 0.1)} 0 0.1vh, transparent 0.1vh 1.2vh)`,
          opacity: 0.5,
        }}
      />
      {/* the X gradient, as the brand's thin slanted bar along the foot */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '0.3vh',
          background: lsxBrand.gradientX,
        }}
      />
      {entry.bannerKicker && (
        <Text
          ff="LSX Display" tt="uppercase" c={accent}
          style={{ fontSize: SIZE.kicker, letterSpacing: '0.2em', position: 'relative' }}
        >
          {entry.bannerKicker}
        </Text>
      )}
      {entry.bannerWord && (
        <Text
          ff="LSX Display Bold" c={lsxBrand.ink}
          style={{
            fontSize: SIZE.word,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            position: 'relative',
            whiteSpace: 'pre-line',
          }}
        >
          {entry.bannerWord}
        </Text>
      )}
    </Flex>
  );
}
