// lsx_lib's NUI uses lsx-ui's locale system as the single source of
// truth — no duplicate store, no separate UPDATE_LSX_LIB_LOCALES listener,
// and LsxProvider's existing subscription handles re-renders automatically
// when an admin changes the language at runtime.
export { locale, localeStore } from "lsx-ui";
