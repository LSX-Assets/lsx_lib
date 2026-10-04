// Locale bundles as they would arrive from each script.
//
// In game lsx_lib asks every registered resource for its bundle in the active
// language (its own locales/<lang>.json, `settings.*` namespace) and hands them
// to the panel keyed by resource. Only a handful are translated here on purpose
// - the rest fall through to the schema's English, which is exactly what a
// part-translated script looks like on a real server.

import type { LocaleBundles } from './studioLocale';

export const MOCK_LOCALES: LocaleBundles = {
  lsx_lib: {
    en: {},
    fr: {
      'sections.basic.label': 'Général',
      'sections.appearance.label': 'Apparence',
      'sections.groups.label': 'Groupes',
      'sections.discord.label': 'Discord',
      'sections.logger.label': 'Protokoll',
      'sections.advanced.label': 'Avancé',
      'sections.bridging.label': 'Connexions',
      'settings.appearance.language.label': 'Langue',
      'settings.appearance.language.description': "S'applique immédiatement — aucun redémarrage.",
      'settings.appearance.primaryColor.label': 'Couleur principale',
    },
    de: {
      'sections.basic.label': 'Allgemein',
      'sections.appearance.label': 'Darstellung',
      'sections.groups.label': 'Gruppen',
      'sections.discord.label': 'Discord',
      'sections.logger.label': 'Protokollierung',
      'sections.advanced.label': 'Erweitert',
      'sections.bridging.label': 'Verbindungen',
      'settings.appearance.language.label': 'Sprache',
      'settings.appearance.primaryColor.label': 'Primärfarbe',
    },
  },
};
