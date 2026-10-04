// Stand-in for the change log the server already keeps. The shape is exactly
// dirk-cfx-react's ScriptConfigHistoryEntry, so wiring the real callback later
// is a data swap, not a UI change.
//
// Timestamps are fixed rather than relative to "now" so the mock renders the
// same on every load and is easy to talk about.

export type HistoryChange = { path: string; old: unknown; new: unknown };

export type HistoryEntry = {
  at_unix: number;
  at_utc: string;
  script: string;
  admin?: { source?: number; name?: string; identifier?: string };
  expected_version?: number;
  applied_version?: number;
  changes: HistoryChange[];
};

const ALEX = { source: 2, name: 'Alex', identifier: 'license2:9a1b4c7e2f' };
const MOD = { source: 14, name: 'Kayla (mod)', identifier: 'license2:44de91b0aa' };
const CONSOLE = { name: 'console' };

export const MOCK_HISTORY: Record<string, HistoryEntry[]> = {
  lsx_lib: [
    {
      at_unix: 1755596000, at_utc: '2026-08-19 08:13:20', script: 'lsx_lib',
      admin: ALEX, expected_version: 12, applied_version: 13,
      changes: [{ path: 'bridging.inventory', old: 'auto', new: 'ox_inventory' }],
    },
    {
      at_unix: 1755166000, at_utc: '2026-08-14 08:46:40', script: 'lsx_lib',
      admin: ALEX, expected_version: 11, applied_version: 12,
      changes: [{ path: 'appearance.primaryShade', old: 7, new: 5 }],
    },
    {
      at_unix: 1755512700, at_utc: '2026-08-18 09:05:00', script: 'lsx_lib',
      admin: MOD, expected_version: 10, applied_version: 11,
      changes: [
        { path: 'groups.maxMembers', old: 4, new: 6 },
        { path: 'groups.inviteValidTime', old: 5, new: 10 },
      ],
    },
    {
      at_unix: 1755340000, at_utc: '2026-08-16 09:06:40', script: 'lsx_lib',
      admin: CONSOLE, expected_version: 9, applied_version: 10,
      changes: [
        { path: 'discord.token', old: '', new: '(server only - hidden)' },
      ],
    },
    {
      at_unix: 1755253600, at_utc: '2026-08-15 09:06:40', script: 'lsx_lib',
      admin: ALEX, expected_version: 8, applied_version: 9,
      changes: [
        { path: 'basic.serverName', old: 'My Server', new: 'Los Santos Roleplay' },
        { path: 'basic.currency', old: '$', new: '$' },
      ],
    },
  ],
};
