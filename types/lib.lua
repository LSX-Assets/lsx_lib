---@meta

--[[
  lsx_lib type definitions.

  WHY THIS FILE EXISTS
  `lib` is built in init.lua as a table with an __index metamethod that loads
  modules/<name>/<context>.lua on first access. That is invisible to a language
  server: nothing in the source textually assigns lib.target, so without this
  file every lib.* call resolves to `unknown`, and none of the annotations
  already written across the modules can ever be reached.

  This file declares the SHAPE of lib and nothing else. It deliberately does
  not restate function signatures: those live on the functions themselves, and
  a second copy here would drift the first time one of them changed.

  The classes below are declared empty ON PURPOSE. LuaLS merges same-named
  @class declarations across files, so tagging a module's returned table with
  its matching class name fills the type in from the real source. That keeps
  one copy of the truth and lets the modules be done a few at a time.

  CONTEXT IS PART OF THE TYPE. Every field records whether the module exists on
  the client, the server or both. That is read off the filesystem rather than
  remembered, and it is the mistake that costs the most time: calling a
  server-only module on the client fails at runtime with nothing useful in the
  console.
]]

---@alias lsxlib.context "client"|"server"

-- Module classes. Empty here; each module fills its own in once its returned
-- table carries the matching ---@class tag.
---@class lsxlib.accounts
---@field [string] any
---@class lsxlib.addCommand
---@field [string] any
---@class lsxlib.addKeybind
---@field [string] any
---@class lsxlib.await
---@field [string] any
---@class lsxlib.blip
---@field [string] any
---@class lsxlib.callback
---@field [string] any
---@class lsxlib.class
---@field [string] any
---@class lsxlib.closest
---@field [string] any
---@class lsxlib.diag
---@field [string] any
---@class lsxlib.disableControls
---@field [string] any
---@class lsxlib.discord
---@field [string] any
---@class lsxlib.dispatch
---@field [string] any
---@class lsxlib.doorlock
---@field [string] any
---@class lsxlib.dui
---@field [string] any
---@class lsxlib.file
---@field [string] any
---@class lsxlib.framework
---@field [string] any
---@class lsxlib.game
---@field [string] any
---@class lsxlib.garage
---@field [string] any
---@class lsxlib.getCommandKey
---@field [string] any
---@class lsxlib.gizmo
---@field [string] any
---@class lsxlib.housing
---@field [string] any
---@class lsxlib.interact
---@field [string] any
---@class lsxlib.inventory
---@field [string] any
---@class lsxlib.locale
---@field [string] any
---@class lsxlib.logger
---@field [string] any
---@class lsxlib.math
---@field [string] any
---@class lsxlib.minigame
---@field [string] any
---@class lsxlib.mission
---@field [string] any
---@class lsxlib.money
---@field [string] any
---@class lsxlib.objects
---@field [string] any
---@class lsxlib.player
---@field [string] any
---@class lsxlib.positionPicker
---@field [string] any
---@class lsxlib.print
---@field [string] any
---@class lsxlib.raycast
---@field [string] any
---@class lsxlib.registerTebexHook
---@field [string] any
---@class lsxlib.request
---@field [string] any
---@class lsxlib.require
---@field [string] any
---@class lsxlib.scenes
---@field [string] any
---@class lsxlib.scriptConfig
---@field [string] any
---@class lsxlib.string
---@field [string] any
---@class lsxlib.table
---@field [string] any
---@class lsxlib.target
---@field [string] any
---@class lsxlib.test
---@field [string] any
---@class lsxlib.validate
---@field [string] any
---@class lsxlib.vehicle
---@field [string] any
---@class lsxlib.zones
---@field [string] any

---@class lsxlib
---@field name string The library resource name, always "lsx_lib".
---@field context lsxlib.context Which side this copy is running on.
---@field settings table Live settings, resynced when an admin edits them.
---@field FW table The framework core object, resolved once then cached.
---@field accounts lsxlib.accounts [server] Player accounts and balances.
---@field addCommand lsxlib.addCommand [server] Register a chat command with argument parsing and ACL.
---@field addKeybind lsxlib.addKeybind [client] Register a rebindable key, exposed in the game keybind menu.
---@field await lsxlib.await [shared] Await helpers for promise-shaped values.
---@field blip lsxlib.blip [client] Create, update and destroy map blips.
---@field callback lsxlib.callback [client and server] Request/response between client and server. Note: no timeout argument.
---@field class lsxlib.class [shared] Minimal OOP: classes, constructors and inheritance.
---@field closest lsxlib.closest [shared] Find the nearest ped, player or object within a range.
---@field diag lsxlib.diag [server] Runtime instrumentation and diagnostic dumps.
---@field disableControls lsxlib.disableControls [client] Disable groups of game controls for a frame or a duration.
---@field discord lsxlib.discord [server] Discord guild, member, role and webhook access.
---@field dispatch lsxlib.dispatch [server] Send an alert to the configured dispatch resource.
---@field doorlock lsxlib.doorlock [client and server] Register doors and drive their lock state.
---@field dui lsxlib.dui [client] Offscreen browser surfaces rendered onto textures.
---@field file lsxlib.file [server] Read and write files inside a resource.
---@field framework lsxlib.framework [server] Framework-agnostic player and group lookups.
---@field game lsxlib.game [client] Assorted game-state helpers.
---@field garage lsxlib.garage [server] Vehicle storage through the garage or framework bridge.
---@field getCommandKey lsxlib.getCommandKey [client] The key currently bound to a command.
---@field gizmo lsxlib.gizmo [client] In-world translate, rotate and scale handles for placing things.
---@field housing lsxlib.housing [client] Property and interior state through the housing bridge.
---@field interact lsxlib.interact [client] Proximity interaction prompts.
---@field inventory lsxlib.inventory [client and server] Items, stashes and inventory operations.
---@field locale lsxlib.locale [shared] Translation lookup. Positional arguments use %s, in order.
---@field logger lsxlib.logger [server] Structured logging to the configured sink.
---@field math lsxlib.math [shared] Numeric helpers: clamp, lerp, rounding, colour and vector conversion.
---@field minigame lsxlib.minigame [client] Run a minigame through whichever provider is configured.
---@field mission lsxlib.mission [client and server] Multi-step missions with progress, reconnect handling and failure.
---@field money lsxlib.money [server] Balances and change notifications.
---@field objects lsxlib.objects [client] Networked props with enter, exit and inside callbacks.
---@field player lsxlib.player [client and server] Player identity, online checks and customisation.
---@field positionPicker lsxlib.positionPicker [client] Let a player pick a position or heading in-world.
---@field print lsxlib.print [shared] Levelled printing with per-type conditions.
---@field raycast lsxlib.raycast [client] Casts from camera, coords or screen, plus screen and world conversion.
---@field registerTebexHook lsxlib.registerTebexHook [server] React to Tebex purchase, renewal and removal events.
---@field request lsxlib.request [client] Await streamed assets: models, anim dicts, audio banks, textures.
---@field require lsxlib.require [shared] Module loading. Overrides the global require.
---@field scenes lsxlib.scenes [client] Synced scenes with peds and props. Release handles or they leak.
---@field scriptConfig lsxlib.scriptConfig [client and server] Per-script settings, permissions and the admin settings UI.
---@field string lsxlib.string [shared] String helpers.
---@field table lsxlib.table [shared] Table helpers: compare, clone, count, convert.
---@field target lsxlib.target [client] Third-eye targeting through whichever target resource is installed.
---@field test lsxlib.test [client and server] Console test runner. Needs the lsx_lib 'test' manifest flag.
---@field validate lsxlib.validate [shared] Chainable value validation and coercion.
---@field vehicle lsxlib.vehicle [client and server] Plates, keys, fuel and class lookups.
---@field zones lsxlib.zones [client and server] Poly, box and sphere zones with enter and exit callbacks.
---@field onCache fun(key: string, cb: fun(value: any)) Calls cb with the current value, then again on every change.
---@field loadBridge fun(kind: string, implementation: string, context: string): table Load a bridge implementation by name.

---The library itself. A global, set by init.lua.
---@type lsxlib
lib = {}

---@class lsxlib.cache
---@field resource string The resource this copy of lib is running in.
---@field game string The game name reported by the runtime.
---@field charName any [client] Cached player state, refreshed on change.
---@field citizenId any [client] Cached player state, refreshed on change.
---@field cuffed any [client] Cached player state, refreshed on change.
---@field dead any [client] Cached player state, refreshed on change.
---@field driver any [client] Cached player state, refreshed on change.
---@field gang any [client] Cached player state, refreshed on change.
---@field job any [client] Cached player state, refreshed on change.
---@field mount any [client] Cached player state, refreshed on change.
---@field ped any [client] Cached player state, refreshed on change.
---@field seat any [client] Cached player state, refreshed on change.
---@field vehicle any [client] Cached player state, refreshed on change.
---@field weapon any [client] Cached player state, refreshed on change.
---@field playerLoaded any [client] Cached player state, refreshed on change.

--[[
  Cached player state. Reading a key subscribes to its change event, so the
  value stays current without anything having to poll for it.

  Also callable as cache(key, fn, timeout) to memoise fn under key, optionally
  expiring the entry after timeout milliseconds.
]]
---@type lsxlib.cache
cache = {}

---Translate a key. Positional arguments substitute into %s, in order.
---@param key string
---@param ... any
---@return string
function locale(key, ...) end

