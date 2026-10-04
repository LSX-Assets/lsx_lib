<p align="center">
  <img src=".github/assets/lsx-logo.png" alt="LSX Assets" width="160">
</p>

# lsx_lib

The shared library behind LSX Assets scripts for FiveM. It follows the
standards set by ox_lib and adds bridges for the frameworks, inventories,
targets, vehicle keys, fuel, garages, phones, dispatch and clothing systems a
server already runs, plus one settings panel for every LSX script.

[Store](https://lsxassets.com) · [Discord](https://discord.gg/SutFab8d7P) · [Releases](https://github.com/LSX-Assets/lsx_lib/releases/latest)

## Install

1. Download `lsx_lib.zip` from the [latest release](https://github.com/LSX-Assets/lsx_lib/releases/latest).
   The zip has the UI already built. A clone of this repo does not.
2. Drop the `lsx_lib` folder in your resources.
3. Ensure it after `oxmysql` and your framework, before any script that uses it:

```cfg
ensure oxmysql
ensure qbx_core
ensure lsx_lib
```

Requires server artifact 7290 or newer and OneSync.

## Configure

Type `/lsx_config` in game to open Script Studio, the one settings panel for
every LSX script. `/<resource_name>` opens it with that script selected.

Admins can open it out of the box: anyone passing `group.admin` or `admin` in
`IsPlayerAceAllowed`. Grant other people on its Admins page, or replace that
list with your own ACE values:

```cfg
setr lsx_lib_master_group "group.admin,group.god"
```

Bridges default to `auto`, so lsx_lib detects what is installed. The console
prints what it found when the resource starts.

### Convars

The panel is where settings live. These convars are still read as one-time
defaults for servers moving over, and the console reminds you while any are
set:

```cfg
# Theme for every LSX UI. 'custom' is the palette set in the panel, which
# ships as the LSX green. Shades run 0 (lightest) to 9 (darkest); 5 is the brand green.
setr lsx_lib:primaryColor custom
setr lsx_lib:primaryShade 5

setr lsx_lib:language en
setr lsx_lib:debug false
setr lsx_lib:currency $
setr lsx_lib:serverName "My Server"
setr lsx_lib:logo https://example.com/logo.png

# Bridges ('auto' detects what is running)
setr lsx_lib:framework qbx_core
setr lsx_lib:inventory ox_inventory
setr lsx_lib:itemImgPath nui://ox_inventory/web/images/
setr lsx_lib:primaryIdentifier license
setr lsx_lib:target ox_target
setr lsx_lib:interact sleepless_interact
setr lsx_lib:phone lb-phone
setr lsx_lib:keys qbx_vehiclekeys
setr lsx_lib:fuel ox_fuel

# UI: lsx_lib's own, or ox_lib's
setr lsx_lib:notify lsx_lib
setr lsx_lib:notifyPosition top-right
setr lsx_lib:contextMenu lsx_lib
setr lsx_lib:dialog lsx_lib
setr lsx_lib:showTextUI lsx_lib
setr lsx_lib:showTextPosition bottom-center
setr lsx_lib:progress lsx_lib
setr lsx_lib:progBarPosition bottom-center

# Groups
setr lsx_groups:maxMembers 5
setr lsx_groups:maxDistanceInvite 5
setr lsx_groups:inviteValidTime 5
setr lsx_groups:maxLogOffTime 5
```

## Anticheats

An anticheat that filters events can drop lsx_lib's callbacks before the
server sees them. Scripts then run on default settings and the client logs
`Callback ... timed out`. lsx_lib names a known anticheat in the console at
boot, and a client probe reports when its requests get no answer.

The fix is the same everywhere: whitelist every event that starts with
`__lsx_cb_`. Every LSX script talks to its server through those. Look for
the event whitelist or safe-events list in your anticheat's config.

## Self-check

`lsxtest` in the server console runs each script's tests against your own
framework and inventory. `lsxtest <resource>` runs one script's tests. It is
console only, because a test is allowed real side effects.

## For developers

Use the library from another resource:

```lua
-- fxmanifest.lua
shared_script '@lsx_lib/init.lua'
lsx_lib 'scriptConfig' -- only if the resource ships a schema.json for Script Studio
```

### Hot-reloading settings in consumer resources

`lib.onSettings(key | keys, cb, options?)` fires whenever the named keys on
`lib.settings` change. lsx_lib broadcasts every Script Studio change;
consumers update their local `lib.settings` in place and forward the patch to
their NUI as `UPDATE_DIRK_LIB_SETTINGS`, the message dirk-cfx-react's
`DirkProvider` listens for.

```lua
lib.onSettings('currency', function(new, old)
  print(('currency: %s -> %s'):format(old.currency, new.currency))
end)

lib.onSettings({ 'primaryColor', 'primaryShade' }, function(new)
  refreshHud(new.primaryColor, new.primaryShade)
end, { immediate = true }) -- fire once with current values
```

`lib.settings` is mutated in place. Do not replace it or any of its subtables
with a new reference: other files capture subtable references at load time
(`local groups = lib.settings.groups`), and a fresh table leaves those
pointing at stale data. `src/onSettings.lua` wipes and refills existing tables
instead; match that if you add code that writes to `lib.settings`.

Anything added to the public `init.lua` `lib` table that lsx_lib's own modules
rely on must also exist in `src/init.lua` (for example `lib.onCache`). Both
load in different VMs but share module code, so a missing field in
`src/init.lua` crashes lsx_lib mid-load.

### Building the UI

The NUI is React + Mantine in `web/`, built on the
[dirk-cfx-react](https://www.npmjs.com/package/dirk-cfx-react) UI kit.

```sh
cd web
pnpm install
pnpm start   # dev server on :3001 with mock data, no game needed
pnpm build   # writes web/build, which the resource loads
```

The colours, type and shapes follow the LSX brand: green-black surfaces,
Chakra Petch headings, IBM Plex Sans text, JetBrains Mono for numbers, square
corners with a 45° chamfer, and the teal-to-volt X gradient. They live in
`web/src/theme/lsx.ts` (`lsxBrand`, `lsxPalette`, `lsxDark` and the
`lsxThemeOverride` handed to `DirkProvider`) and `web/src/fonts/lsx.css`. The
fonts are bundled, and that stylesheet also points the kit's own font names at
them, so its components match.

## Releases

Every push to `main` builds the UI, bumps the patch version in
`fxmanifest.lua`, commits that back, and publishes a GitHub release with
`lsx_lib.zip` attached. Put `[no-bump]` in the commit message to ship the
manifest version exactly as written, which is how a minor or major version
goes out.

Release notes come from `changelogs/lsx_lib.json` in
[lsx_publicInfo](https://github.com/LSX-Assets/lsx_publicInfo) when it has an
entry for the version, and from the commit list otherwise.

After cloning, run `git config core.hooksPath .githooks` once. The pre-push
hook pulls in the release bot's version bump before you push to `main`, so
the push is never rejected over a version line.

## License

LGPL-3.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE.md).
