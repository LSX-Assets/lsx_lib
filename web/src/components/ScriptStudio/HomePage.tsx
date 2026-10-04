import { alpha, Flex, Text, useMantineTheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowUpRight, BookOpen, ChevronRight, History, MessageCircle, Save, Search, ShieldCheck,
} from 'lucide-react';
import { openLink } from 'dirk-cfx-react';
import { Dispatch } from './Dispatch';
import { useStudio } from './store';
import { translate, useActiveLanguage, useBundles } from './studioLocale';
import { Icon } from './main';
import { lsxBrand } from '../../theme/lsx';
import lsxLogo from '../../assets/lsx-logo.png';

/**
 * Where `/lsx_config` lands: the LSX Assets front door.
 *
 * It borrows lsxassets.com's home page: an uppercase headline whose second
 * line is outlined, a small kicker above it, real numbers in mono, and
 * sections that open on a two-tone title. Under the hero, news from LSX Assets
 * sits on the left and this server's LSX scripts on the right.
 *
 * Landing on whichever script sorted first made the panel look like it was
 * about that script; `/<resource>` still opens a script directly.
 */
export function HomePage() {
  const scripts = useStudio((s) => s.scripts);

  // Panel chrome, resolved against lsx_lib's own bundle rather than whichever
  // script happens to be selected.
  const language = useActiveLanguage();
  const bundles = useBundles();
  const t = (key: string, fallback: string) =>
    translate(bundles, language, 'lsx_lib', `studio.${key}`, fallback);

  const configurable = scripts.filter((s) => !s.shared);
  const shared = scripts.find((s) => s.shared);
  const settingCount = scripts.reduce((sum, s) => sum + s.entries.length, 0);
  const [howOpen, setHowOpen] = useState(false);

  const open = (resource: string) => useStudio.setState({ activeResource: resource, activePage: null });

  const spec = [
    `${configurable.length} ${configurable.length === 1 ? t('home.stat.script', 'script') : t('home.stat.scripts', 'scripts')}`,
    `${settingCount} ${t('home.stat.settings', 'settings')}`,
    shared ? `${shared.resource} ${shared.version}` : null,
  ].filter(Boolean).join('  ·  ');

  return (
    /* One panel, not a scroll: the hero and both columns fit the window, and
       the news column scrolls inside itself when there is a lot of it. */
    <Flex direction="column" gap="lg" p="lg" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Hero
        kicker={t('home.hero.kicker', 'LSX Assets · Script Studio')}
        solid={t('home.hero.solid', 'Built for')}
        outline={t('home.hero.outline', 'Los Santos')}
        body={t('home.hero.body', 'Every LSX script on this server, set up in one place. Pick a script on the left, or start with the settings they all share.')}
        spec={spec}
      >
        {shared && (
          <BrandButton primary onClick={() => open(shared.resource)}>
            {t('home.hero.shared', 'Shared settings')}
          </BrandButton>
        )}
        <BrandButton onClick={() => openLink(lsxBrand.links.store)} icon={ArrowUpRight}>
          lsxassets.com
        </BrandButton>
        <BrandButton onClick={() => openLink(lsxBrand.links.discord)} icon={MessageCircle}>
          {t('home.hero.discord', 'Discord')}
        </BrandButton>
      </Hero>

      <Flex gap="xl" style={{ flex: 1, minHeight: 0 }}>
        {/* News from LSX Assets: lsx_publicInfo's announcements, matched to
            what this server runs. Anything urgent reads first. */}
        <Flex direction="column" gap="sm" style={{ flex: 1.6, minWidth: 0, minHeight: 0 }}>
          <SectionTitle
            kicker={t('home.news.kicker', 'From LSX Assets')}
            solid={t('home.news.solid', 'Latest')}
            outline={t('home.news.outline', 'news')}
          />
          <Flex
            direction="column"
            className="studio-scroll"
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.4vh' }}
          >
            <Dispatch
              empty={(
                <EmptyCard
                  title={t('home.news.empty.title', 'Nothing new right now')}
                  body={t('home.news.empty.body', 'Releases and updates from LSX Assets show up here as they land.')}
                />
              )}
            />
          </Flex>
        </Flex>

        <Flex direction="column" gap="sm" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <SectionTitle
            kicker={t('home.scripts.kicker', 'On this server')}
            solid={t('home.scripts.solid', 'Your')}
            outline={t('home.scripts.outline', 'scripts')}
          />
          <Flex direction="column" gap="xs" style={{ flexShrink: 0 }}>
            {shared && (
              <ScriptTile
                icon={shared.icon}
                label={shared.label}
                meta={`${shared.resource} ${shared.version} · ${shared.entries.length} ${t('home.stat.settings', 'settings')}`}
                onClick={() => open(shared.resource)}
              />
            )}
            {configurable.map((script) => (
              <ScriptTile
                key={script.resource}
                icon={script.icon}
                label={script.label}
                meta={`${script.resource} ${script.version} · ${script.entries.length} ${t('home.stat.settings', 'settings')}`}
                onClick={() => open(script.resource)}
              />
            ))}
            {configurable.length === 0 && (
              <EmptyCard
                title={t('home.scripts.empty.title', 'No LSX scripts here yet')}
                body={t('home.scripts.empty.body', 'Each LSX script you install gets its own page in this panel.')}
                action={{ label: t('home.scripts.empty.action', 'Browse LSX Assets'), onClick: () => openLink(lsxBrand.links.store) }}
              />
            )}
          </Flex>

          {/* Worth reading once, so it folds away instead of costing height. */}
          <Flex direction="column" gap="xs" style={{ minHeight: 0, marginTop: 'auto' }}>
            <motion.button
              type="button"
              onClick={() => setHowOpen((v) => !v)}
              whileTap={{ scale: 0.995 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6vh',
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', textAlign: 'left', width: 'fit-content',
              }}
            >
              <ChevronRight
                size="1.4vh"
                color={lsxBrand.inkMuted}
                style={{ transform: howOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
              />
              <Text ff="LSX Display" size="xxs" tt="uppercase" lts="0.12em" c={lsxBrand.inkMuted}>
                {t('home.how', 'How this works')}
              </Text>
            </motion.button>

            {howOpen && (
              <Flex direction="column" gap="xxs" className="studio-scroll" style={{ minHeight: 0, overflowY: 'auto' }}>
                <Note icon={Save} title={t('home.note.save.title', 'Nothing saves until you press Save')}>
                  {t('home.note.save.body', 'Edits are staged. The bar at the bottom counts them, Undo and Redo step through them, and Discard throws the lot away.')}
                </Note>
                <Note icon={History} title={t('home.note.overrides.title', 'Only what you changed is stored')}>
                  {t('home.note.overrides.body', 'A setting you never touch keeps following the script default, so improvements that ship in an update actually reach this server. Change history shows who changed what, and lets you put it back.')}
                </Note>
                <Note icon={Search} title={t('home.note.search.title', 'Search covers everything')}>
                  {t('home.note.search.body', 'Names, descriptions, setting paths and list rows, across the whole script.')}
                </Note>
                <Note icon={ShieldCheck} title={t('home.note.serverOnly.title', 'Some settings never leave the server')}>
                  {t('home.note.serverOnly.body', 'Tokens, webhooks and keys are marked SERVER ONLY. They are editable here and are never sent to players.')}
                </Note>
                <Note icon={BookOpen} title={t('home.note.invalid.title', 'Red means it will not save')}>
                  {t('home.note.invalid.body', 'A setting outside its allowed range blocks saving and says why. Greyed-out settings are switched off by another setting, which is named on the row.')}
                </Note>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

const outlined = {
  color: 'transparent',
  WebkitTextStroke: `max(1px, 0.1vh) ${lsxBrand.ink}`,
} as const;

/** The site's section title: one solid word, then an outlined one. */
function TwoTone({ solid, outline, size }: { solid: string; outline: string; size: string }) {
  return (
    <Text
      component="span"
      ff="LSX Display Bold"
      tt="uppercase"
      style={{ fontSize: size, lineHeight: 1, letterSpacing: '-0.01em', color: lsxBrand.ink }}
    >
      {solid} <span style={outlined}>{outline}</span>
    </Text>
  );
}

function Kicker({ children, color = lsxBrand.inkMuted }: { children: React.ReactNode; color?: string }) {
  return (
    <Text ff="LSX Display" tt="uppercase" lts="0.14em" c={color} style={{ fontSize: '1.1vh' }}>
      {children}
    </Text>
  );
}

function SectionTitle({ kicker, solid, outline }: { kicker: string; solid: string; outline: string }) {
  return (
    <Flex direction="column" gap="0.4vh" style={{ flexShrink: 0 }}>
      <Kicker>{kicker}</Kicker>
      <TwoTone solid={solid} outline={outline} size="2.6vh" />
    </Flex>
  );
}

function Hero({
  kicker, solid, outline, body, spec, children,
}: {
  kicker: string;
  solid: string;
  outline: string;
  body: string;
  spec: string;
  children: React.ReactNode;
}) {
  const headline = { fontSize: '4.6vh', lineHeight: 0.95, letterSpacing: '-0.01em' } as const;

  return (
    <Flex
      style={{
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
        clipPath: lsxBrand.chamfer('2vh'),
        background: `radial-gradient(90% 120% at 82% 40%, ${alpha(lsxBrand.green, 0.14)}, transparent 60%),
          linear-gradient(150deg, ${lsxBrand.brandSoft} 0%, ${lsxBrand.surface} 55%, ${lsxBrand.surfaceRaised} 100%)`,
      }}
    >
      {/* The mark itself, the file the brand ships: white letters on the dark
          ground, with clear space round it and a soft green lift behind. */}
      <Flex
        align="center" justify="center"
        style={{
          position: 'absolute', right: '4vh', top: 0, bottom: 0, width: '30vh',
          background: `radial-gradient(closest-side, ${alpha(lsxBrand.green, 0.16)}, transparent)`,
        }}
      >
        <img src={lsxLogo} alt="LSX Assets" draggable={false} style={{ height: '20vh', aspectRatio: '1 / 1', display: 'block' }} />
      </Flex>

      <Flex
        direction="column" justify="center" gap="1vh"
        style={{ position: 'relative', padding: '2.6vh 3.2vh 2.8vh', maxWidth: '66%' }}
      >
        <Kicker color={lsxBrand.lime}>{kicker}</Kicker>
        <Flex direction="column">
          <Text component="span" ff="LSX Display Bold" tt="uppercase" c={lsxBrand.ink} style={headline}>
            {solid}
          </Text>
          <Text component="span" ff="LSX Display Bold" tt="uppercase" style={{ ...headline, ...outlined }}>
            {outline}
          </Text>
        </Flex>
        <Text ff="LSX Sans" c={alpha(lsxBrand.ink, 0.78)} style={{ fontSize: '1.55vh', lineHeight: 1.5, maxWidth: '58vh' }}>
          {body}
        </Text>
        <Flex gap="xs" wrap="wrap" mt="0.4vh">{children}</Flex>
        <Text ff="LSX Mono" tt="uppercase" c={lsxBrand.inkMuted} style={{ fontSize: '1.1vh', letterSpacing: '0.06em' }}>
          {spec}
        </Text>
      </Flex>

      {/* the X gradient as the brand's thin bar along the foot */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '0.3vh', background: lsxBrand.gradientX }} />
    </Flex>
  );
}

function BrandButton({
  primary, icon: ButtonIcon, onClick, children,
}: {
  primary?: boolean;
  icon?: React.ElementType;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ backgroundColor: primary ? '#6BEA9E' : '#22302A' }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6vh',
        height: '4.2vh', padding: '0 1.8vh',
        backgroundColor: primary ? lsxBrand.green : lsxBrand.surfaceOverlay,
        border: 'none',
        clipPath: lsxBrand.chamfer('0.7vh'),
        cursor: 'pointer',
        color: primary ? lsxBrand.onBrand : lsxBrand.ink,
        fontFamily: 'LSX Display', fontSize: '1.3vh', letterSpacing: '0.08em', textTransform: 'uppercase',
      }}
    >
      {children}
      {ButtonIcon && <ButtonIcon size="1.5vh" />}
    </motion.button>
  );
}

function ScriptTile({
  icon, label, meta, onClick,
}: {
  icon: string;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ backgroundColor: alpha(color, 0.1) }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '1.2vh',
        padding: '1.2vh 1.4vh',
        backgroundColor: alpha(lsxBrand.surfaceRaised, 0.8),
        border: `0.1vh solid ${lsxBrand.line}`,
        clipPath: lsxBrand.chamfer('1.2vh'),
        cursor: 'pointer', textAlign: 'left', width: '100%',
      }}
    >
      <Icon name={icon} size="2.2vh" color={color} />
      <Flex direction="column" style={{ lineHeight: 1.25, minWidth: 0, flex: 1 }}>
        <Text ff="LSX Display" tt="uppercase" lts="0.04em" c={lsxBrand.ink} style={{ fontSize: '1.5vh' }} truncate>
          {label}
        </Text>
        <Text ff="LSX Mono" c={lsxBrand.inkMuted} style={{ fontSize: '1.1vh' }} truncate>{meta}</Text>
      </Flex>
      <ChevronRight size="1.8vh" color={lsxBrand.inkMuted} />
    </motion.button>
  );
}

function EmptyCard({
  title, body, action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Flex
      direction="column" gap="0.5vh"
      style={{ padding: '1.4vh 1.6vh', border: `0.1vh dashed ${alpha(lsxBrand.lineStrong, 0.6)}` }}
    >
      <Text ff="LSX Display" c={lsxBrand.ink} style={{ fontSize: '1.45vh' }}>{title}</Text>
      <Text ff="LSX Sans" c={lsxBrand.inkMuted} style={{ fontSize: '1.3vh', lineHeight: 1.45 }}>{body}</Text>
      {action && (
        <motion.button
          type="button"
          onClick={action.onClick}
          whileHover={{ x: 2 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4vh', width: 'fit-content',
            marginTop: '0.4vh', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
            color: lsxBrand.green, fontFamily: 'LSX Display', fontSize: '1.2vh',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          {action.label}
          <ArrowUpRight size="1.4vh" />
        </motion.button>
      )}
    </Flex>
  );
}

function Note({
  icon: NoteIcon, title, children,
}: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Flex
      align="flex-start" gap="sm" px="sm" py="xs"
      style={{ background: alpha(lsxBrand.surfaceRaised, 0.6), border: `0.1vh solid ${lsxBrand.line}` }}
    >
      <NoteIcon size="1.7vh" color={lsxBrand.inkMuted} style={{ marginTop: '0.3vh', flexShrink: 0 }} />
      <Flex direction="column" style={{ lineHeight: 1.35 }}>
        <Text ff="LSX Display" size="xs" c={alpha(lsxBrand.ink, 0.9)}>{title}</Text>
        <Text ff="LSX Sans Medium" size="xxs" c={lsxBrand.inkMuted}>{children}</Text>
      </Flex>
    </Flex>
  );
}
