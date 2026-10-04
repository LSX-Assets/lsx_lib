// Stand-in for the local log sink.
//
// The SHAPE here is the contract, not just filler: `fetchLogs` takes and
// returns exactly what the server callback will, including keyset paging
// (`cursor` = "everything older than this id"), server-side filtering, and a
// deliberate delay so the UI is built against a request that can be slow.
//
// Nothing here filters client-side. That is the whole point - the real table
// is millions of rows and the panel must never hold more than a page of it.

export type LogLevel = 'info' | 'warn' | 'alert';

export type LogRow = {
  id: number;
  /** unix seconds */
  at: number;
  /** the EMITTING resource - lib.logger already captures this */
  resource: string;
  event: string;
  message: string;
  level: LogLevel;
  player?: { name: string; identifier: string; identifiers?: string[]; source?: number };
  tags?: Record<string, string>;
};

export type LogQuery = {
  /** keyset, NOT offset: `WHERE id < cursor ORDER BY id DESC` */
  cursor?: number | null;
  limit?: number;
  resource?: string | null;
  event?: string | null;
  /** name or identifier - matches the indexed columns */
  player?: string;
  /** free text over the message, always bounded by the time window */
  search?: string;
  /** unix seconds; null = no lower bound */
  since?: number | null;
  level?: LogLevel | null;
};

export type LogPage = {
  rows: LogRow[];
  /** null when there is nothing older */
  nextCursor: number | null;
};

export type Facet = { name: string; count: number };

// ── the fake table ──────────────────────────────────────────────────────────

/** One clock for the whole mock, so the table and the delivery block agree. */
export const MOCK_NOW = Math.floor(Date.now() / 1000);

/** Deterministic, so the page renders the same on every reload. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const PLAYERS = [
  { name: 'Alex', identifier: 'license2:9a1b4c7e2f' },
  { name: 'Kayla Reyes', identifier: 'license2:44de91b0aa' },
  { name: 'Marcus Webb', identifier: 'license2:71c0ea3d95' },
  { name: 'Ana Petrov', identifier: 'license2:0f8b26cc41' },
  { name: 'Tom Halloway', identifier: 'license2:d3517ae620' },
  { name: 'Jae-Sun Park', identifier: 'license2:be409f172c' },
];

type EventSpec = { event: string; level?: LogLevel; weight: number; line: (r: () => number, who: string) => string };

const CATALOGUE: Record<string, EventSpec[]> = {
  lsx_lib: [
    { event: 'configSaved', weight: 10, line: (r, who) => `${who} saved ${pick(r, ['Basic', 'Appearance', 'Bridging', 'Logger', 'Groups'])} (${1 + Math.floor(r() * 5)} changes)` },
    { event: 'groupCreated', weight: 14, line: (r, who) => `${who} started a group of ${2 + Math.floor(r() * 3)}` },
    { event: 'groupInvite', weight: 18, line: (r, who) => `${who} invited ${pick(r, ['Kayla Reyes', 'Marcus Webb', 'Ana Petrov', 'Tom Halloway'])} to their group` },
    { event: 'groupDisbanded', weight: 6, line: (_r, who) => `${who} disbanded their group` },
    { event: 'languageChanged', weight: 2, line: (r, who) => `${who} switched the panel language to ${pick(r, ['English', 'Deutsch', 'Français', 'Español'])}` },
    { event: 'adminGranted', level: 'warn', weight: 2, line: (r, who) => `${who} granted ${pick(r, ['Kayla Reyes', 'Marcus Webb'])} edit access` },
    { event: 'adminRevoked', level: 'warn', weight: 1, line: (r, who) => `${who} revoked access from ${pick(r, ['Tom Halloway', 'Ana Petrov'])}` },
    { event: 'bridgeChanged', weight: 3, line: (r, who) => `${who} set the ${pick(r, ['fuel', 'dispatch', 'target'])} bridge to ${pick(r, ['ox_fuel', 'ps-dispatch', 'ox_target'])}` },
    { event: 'discordTest', weight: 2, line: (r, who) => `${who} sent a test message to #${pick(r, ['server-logs', 'staff'])}` },
    { event: 'configReset', level: 'warn', weight: 1, line: (_r, who) => `${who} reset Logger to defaults` },
    { event: 'callbackTimeout', level: 'alert', weight: 1, line: (_r, who) => `${who}'s client got no answer from the server - check the anticheat whitelist for __lsx_cb_` },
  ],
};

function pick<T>(r: () => number, list: T[]): T {
  return list[Math.floor(r() * list.length)]!;
}

/** ~4,000 rows, newest first. Built once. */
const TABLE: LogRow[] = (() => {
  const r = seeded(20260819);
  const rows: LogRow[] = [];

  const weighted: { resource: string; spec: EventSpec }[] = [];
  for (const [resource, specs] of Object.entries(CATALOGUE)) {
    for (const spec of specs) {
      for (let i = 0; i < spec.weight; i += 1) weighted.push({ resource, spec });
    }
  }

  // Walk backwards from now so ids and timestamps agree: a higher id is always
  // more recent, which is what keyset paging relies on. Anchored to the real
  // clock rather than a fixed date, so the time-range filters actually have
  // something to select and the page reads like a live server.
  let at = MOCK_NOW;

  for (let id = 4000; id >= 1; id -= 1) {
    const { resource, spec } = pick(r, weighted);
    const player = pick(r, PLAYERS);
    rows.push({
      id,
      at,
      resource,
      event: spec.event,
      level: spec.level ?? 'info',
      message: spec.line(r, player.name),
      player: { ...player, source: 1 + Math.floor(r() * 60) },
      tags: {
        username: player.name,
        license: player.identifier,
        discord: `discord:${(100000000000000000 + Math.floor(r() * 8e17)).toString()}`,
      },
    });
    at -= 8 + Math.floor(r() * 190); // a few seconds to a few minutes apart
  }

  return rows;
})();

// ── the "server callback" ───────────────────────────────────────────────────

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * What the Lua side will do, in JS. Every filter here maps to an indexed
 * column; the only unindexed one is `search`, which is why the real query
 * pairs it with a time bound.
 */
export async function fetchLogs(query: LogQuery): Promise<LogPage> {
  await wait(140 + Math.random() * 120);

  const limit = query.limit ?? 50;
  const needle = query.search?.trim().toLowerCase();
  const who = query.player?.trim().toLowerCase();

  const rows: LogRow[] = [];
  for (const row of TABLE) {
    if (query.cursor != null && row.id >= query.cursor) continue;
    if (query.resource && row.resource !== query.resource) continue;
    if (query.event && row.event !== query.event) continue;
    if (query.level && row.level !== query.level) continue;
    if (query.since != null && row.at < query.since) continue;
    if (who) {
      const hay = `${row.player?.name ?? ''} ${row.player?.identifier ?? ''}`.toLowerCase();
      if (!hay.includes(who)) continue;
    }
    if (needle && !row.message.toLowerCase().includes(needle)) continue;

    rows.push(row);
    if (rows.length === limit) break;
  }

  const last = rows[rows.length - 1];
  return { rows, nextCursor: rows.length === limit && last ? last.id : null };
}

/**
 * Counts for the filter rail. Cheap in the real thing too: a GROUP BY over an
 * indexed column, bounded by the same time window, cached for a minute.
 */
export async function fetchLogFacets(since: number | null): Promise<{ resources: Facet[]; events: Facet[]; total: number }> {
  await wait(90);

  const resources = new Map<string, number>();
  const events = new Map<string, number>();
  let total = 0;

  for (const row of TABLE) {
    if (since != null && row.at < since) continue;
    total += 1;
    resources.set(row.resource, (resources.get(row.resource) ?? 0) + 1);
    events.set(row.event, (events.get(row.event) ?? 0) + 1);
  }

  const sort = (map: Map<string, number>): Facet[] =>
    [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return { resources: sort(resources), events: sort(events), total };
}

/**
 * Delivery health, as the server reports it. Mirrors `LogHealth` in
 * `logsData.ts` - `routes` is positional, matched back to the redirect rows
 * in the config by index, so entry 0 here describes redirect row 0.
 */
export const MOCK_DELIVERY = {
  local: { enabled: true, retentionDays: 14, rows: TABLE.length, bytes: 3_250_000 },
  routes: [
    {
      id: 'r1',
      label: 'Admin changes to #staff',
      enabled: true,
      resources: ['lsx_lib'],
      sent: 1284,
      dropped: 0,
      queued: 0,
      lastAt: MOCK_NOW - 120,
    },
    {
      id: 'r2',
      label: 'Warnings to #anticheat',
      enabled: true,
      levels: ['warn', 'error'],
      sent: 3,
      dropped: 0,
      queued: 0,
      lastAt: MOCK_NOW - 15780,
    },
    {
      id: 'r3',
      label: 'Everything to #server-logs',
      enabled: false,
      sent: 0,
      dropped: 41,
      queued: 0,
    },
  ],
};
