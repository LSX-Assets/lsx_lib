-- --------------------------------------------------
-- lib.settings — bootstrap
-- --------------------------------------------------
-- The single source of truth for lsx_lib configuration is schema.json
-- + scriptConfig (DB-backed, edited via /lsx_config and /lsx_lib).
-- This file just builds the initial `lib.settings` table at boot:
--
--   1. Hardcoded defaults that mirror schema.json (so lsx_lib can boot
--      even before scriptConfig has loaded its DB row).
--   2. Autodetected resource picks for any `bridging.*` key the schema
--      defaults to "auto" — picked from src/autodetect.lua at boot.
--   3. Legacy convar import: any `lsx_lib:*` convar still set by an
--      admin overrides the matching key (one-shot deprecation path —
--      remove from server.cfg and use the configurator going forward).
--
-- After this file returns, src/settingsOverlay/shared.lua hooks into
-- scriptConfig and overlays DB values on top, so admin edits in the
-- configurator are what wins at runtime.

local autodetected = require 'src.autodetect'

-- Convenience: read a possibly-set convar without forcing it through the
-- raw GetConvar default mechanism, so we can tell "admin set it" from
-- "convar absent". We use a sentinel to detect absence.
local CONVAR_SENTINEL = '\1__lsx_unset__\1'
local function readConvar(name)
  local v = GetConvar(name, CONVAR_SENTINEL)
  if v == CONVAR_SENTINEL then return nil end
  return v
end
local function readConvarBool(name)
  local v = readConvar(name)
  if v == nil then return nil end
  return v == 'true'
end
local function readConvarInt(name)
  local v = readConvar(name)
  if v == nil then return nil end
  return tonumber(v)
end

-- Resolve the "auto" placeholder for bridging.* values.
local function resolveAuto(category, value)
  if value ~= 'auto' then return value end
  local detected = autodetected[category]
  if not detected or detected == 'NOT FOUND' then return 'auto' end
  return detected
end

local settings = {
  -- ── appearance ─────────────────────────────────────────────────────
  primaryColor = 'custom',
  primaryShade = 5,
  customTheme  = { -- the LSX green; shade 5 is the brand colour
    "#EAFCF2", "#D2F8E3", "#ABF1CB", "#82EAB0", "#63E59B",
    "#48E287", "#1FBA83", "#12A882", "#039482", "#027A6B",
  },

  -- ── localization ───────────────────────────────────────────────────
  language = 'en',
  currency = '$',
  -- Display units live with currency because they are the same kind of thing:
  -- a presentation choice the whole server shares, not a per-script setting.
  weightUnit   = 'lb',
  distanceUnit = 'm',

  -- ── branding ───────────────────────────────────────────────────────
  serverName  = 'My Server',
  logo        = 'https://via.placeholder.com/150',
  itemImgPath = nil, -- resolved below from autodetected.itemImgPath

  -- ── bridging: UI providers (default ox_lib) ────────────────────────
  notify          = 'ox_lib',
  progress        = 'ox_lib',
  showTextUI      = 'ox_lib',
  contextMenu     = 'ox_lib',
  alertDialog     = 'ox_lib',
  inputDialog     = 'ox_lib',
  dialog          = 'lsx_lib', -- no ox equivalent

  -- ── bridging: resource providers (resolved from autodetect below) ──
  framework = resolveAuto('framework', 'auto'),
  inventory = resolveAuto('inventory', 'auto'),
  target    = resolveAuto('target', 'auto'),
  interact  = resolveAuto('interact', 'auto'),
  time      = resolveAuto('time', 'auto'),
  keys      = resolveAuto('keys', 'auto'),
  fuel      = resolveAuto('fuel', 'auto'),
  phone     = resolveAuto('phone', 'auto'),
  garage    = resolveAuto('garage', 'auto'),
  clothing  = resolveAuto('clothing', 'auto'),
  ambulance = resolveAuto('ambulance', 'auto'),
  prison    = resolveAuto('prison', 'auto'),
  dispatch  = resolveAuto('dispatch', 'auto'),
  doorlock  = resolveAuto('doorlock', 'auto'),
  skills    = resolveAuto('skills', 'auto'),
  housing   = resolveAuto('housing', 'auto'),

  -- ── advanced ───────────────────────────────────────────────────────
  primaryIdentifier = 'license',
  debug             = false,

  -- ── presentation knobs (kept as plain settings — not exposed in
  --     the configurator yet, but consumers still read them). ─────────
  notifyPosition     = 'top-right',
  notifyAudio        = true,
  progBarPosition    = 'bottom-center',
  showTextPosition   = 'bottom-center',
  contextClickSounds = true,
  contextHoverSounds = true,
  dialogClickSounds  = true,
  dialogHoverSounds  = true,

  -- ── groups ─────────────────────────────────────────────────────────
  groups = {
    maxMembers        = 5,
    maxDistanceInvite = 5,
    inviteValidTime   = 5,
    maxLogOffTime     = 5,
  },
}

settings.itemImgPath = autodetected.itemImgPath or 'nui://ox_inventory/web/images/'

-- ── Legacy convar import ─────────────────────────────────────────────
-- Any `lsx_lib:*` convar that an admin set in server.cfg still wins
-- over hardcoded defaults — but the canonical path going forward is
-- /lsx_config. Remove the convar and use the configurator instead.
local convarMap = {
  -- appearance
  primaryColor    = { name = 'lsx_lib:primaryColor',    type = 'string' },
  primaryShade    = { name = 'lsx_lib:primaryShade',    type = 'int' },
  -- localization
  language        = { name = 'lsx_lib:language',        type = 'string' },
  currency        = { name = 'lsx_lib:currency',        type = 'string' },
  -- branding
  serverName      = { name = 'lsx_lib:serverName',      type = 'string' },
  logo            = { name = 'lsx_lib:logo',            type = 'string' },
  itemImgPath     = { name = 'lsx_lib:itemImgPath',     type = 'string' },
  -- bridging UI
  notify          = { name = 'lsx_lib:notify',          type = 'string' },
  progress        = { name = 'lsx_lib:progress',        type = 'string' },
  showTextUI      = { name = 'lsx_lib:showTextUI',      type = 'string' },
  contextMenu     = { name = 'lsx_lib:contextMenu',     type = 'string' },
  alertDialog     = { name = 'lsx_lib:alertDialog',     type = 'string' },
  inputDialog     = { name = 'lsx_lib:inputDialog',     type = 'string' },
  dialog          = { name = 'lsx_lib:dialog',          type = 'string' },
  -- presentation
  notifyPosition  = { name = 'lsx_lib:notifyPosition',  type = 'string' },
  notifyAudio     = { name = 'lsx_lib:notifyAudio',     type = 'bool' },
  progBarPosition = { name = 'lsx_lib:progBarPosition', type = 'string' },
  showTextPosition = { name = 'lsx_lib:showTextPosition', type = 'string' },
  contextClickSounds = { name = 'lsx_lib:contextClickSounds', type = 'bool' },
  contextHoverSounds = { name = 'lsx_lib:contextHoverSounds', type = 'bool' },
  dialogClickSounds  = { name = 'lsx_lib:dialogClickSounds',  type = 'bool' },
  dialogHoverSounds  = { name = 'lsx_lib:dialogHoverSounds',  type = 'bool' },
  -- advanced
  primaryIdentifier = { name = 'lsx_lib:primaryIdentifier', type = 'string' },
  debug             = { name = 'lsx_lib:debug',             type = 'bool' },
}

-- bridging resource providers — convar still wins, but we resolve "auto" via autodetect
local bridgingCategories = {
  'framework', 'inventory', 'target', 'interact', 'time', 'keys', 'fuel',
  'phone', 'garage', 'clothing', 'ambulance', 'prison', 'dispatch',
  'doorlock', 'skills', 'housing',
}
for _, cat in ipairs(bridgingCategories) do
  convarMap[cat] = { name = ('lsx_lib:%s'):format(cat), type = 'string', autoResolve = cat }
end

local importedKeys = {}
for key, spec in pairs(convarMap) do
  local raw
  if spec.type == 'bool' then
    raw = readConvarBool(spec.name)
  elseif spec.type == 'int' then
    raw = readConvarInt(spec.name)
  else
    raw = readConvar(spec.name)
  end
  if raw ~= nil then
    if spec.autoResolve then
      raw = resolveAuto(spec.autoResolve, raw)
    end
    settings[key] = raw
    importedKeys[#importedKeys + 1] = spec.name
  end
end

-- groups.* convars
local groupConvars = {
  maxMembers        = 'lsx_groups:maxMembers',
  maxDistanceInvite = 'lsx_groups:maxDistanceInvite',
  inviteValidTime   = 'lsx_groups:inviteValidTime',
  maxLogOffTime     = 'lsx_groups:maxLogOffTime',
}
for key, name in pairs(groupConvars) do
  local v = readConvarInt(name)
  if v ~= nil then
    settings.groups[key] = v
    importedKeys[#importedKeys + 1] = name
  end
end

if #importedKeys > 0 then
  print(('[lsx_lib] DEPRECATION: %d convar(s) still set in server.cfg. Convars now act as one-time defaults — manage these from /lsx_config (group "bridging" / "branding" / etc.) instead. Affected: %s')
    :format(#importedKeys, table.concat(importedKeys, ', ')))
end

return settings
