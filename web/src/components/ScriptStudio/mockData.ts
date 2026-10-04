// The hub in a browser, rendered from the REAL schema.
//
// lsx_lib/schema.json is copied verbatim into fixtures/ and walked by
// schemaToStudio, so what you see is the library's actual settings, in their
// actual sections - not a hand-written impression of them.
//
// The only hand-written parts are the group icons (the schema has no x-icon
// yet) and the stand-in inventory below.

import libSchema from './fixtures/lsx_lib.schema.json';
import { useItems } from 'dirk-cfx-react';
import { schemaToStudio } from './schemaToStudio';
import type { StudioScript } from './types';

const lib = schemaToStudio(libSchema as Record<string, unknown>, {
  resource: 'lsx_lib',
  label: 'Shared Settings',
  icon: 'library',
  version: '1.0.0',
  shared: true,
  groupIcons: {
    basic: 'sliders-horizontal',
    appearance: 'palette',
    bridging: 'plug',
    groups: 'users',
    access: 'shield',
    discord: 'message-circle',
    logger: 'scroll-text',
    advanced: 'wrench',
  },
  // Both of these have a page of their own that says more than a list of text
  // boxes can: Bridges shows what each choice actually resolved to on this
  // server, and Admins shows who holds access and where it came from. Leaving
  // a second copy in Shared Settings would be the same values in two places.
  managedElsewhere: ['bridging', 'access'],
  // Stand-ins for values an admin has changed, so the panel is not a wall of
  // untouched defaults while the states are being reviewed.
  overrides: {
    'basic.debug': true,
  },
});

export const MOCK_SCRIPTS: StudioScript[] = [lib];

/**
 * Stands in for the live inventory the item picker reads in game.
 *
 * A handful of common items, so the pickers, item images and the
 * missing-items banner have something to show in a browser.
 */
export const MOCK_ITEMS: { name: string; label: string }[] = [
  'bandage', 'bread', 'lockpick', 'money', 'phone', 'radio', 'repairkit', 'water',
].map((name) => ({
  name,
  label: name.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));


// In game FETCH_ALL_ITEMS fills dirk-cfx-react's item store from the inventory
// bridge. In a browser nothing answers it, so seed the same store from the mock
// - that is what makes SelectItem, item images and the inventory-sourced
// label/description mirroring behave the way they will on a server.
useItems.setState(
  Object.fromEntries(MOCK_ITEMS.map((item) => [item.name, {
    name: item.name,
    label: item.label,
    weight: 100,
    image: '',
    description: `${item.label} — description sourced from the inventory.`,
  }])),
  true,
);
