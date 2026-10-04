// lsx_lib's own per-resource access tab — controls who (besides master admins)
// can open & edit lsx_lib's config. Thin wrapper around the shared schema-driven
// AccessOverrideSection (the `access` block). Note: anyone granted here can see
// lsx_lib's secrets (bot token, logger creds) — grant trusted co-admins only.
import { AccessOverrideSection } from "lsx-ui";

export default function AccessSection() {
  return <AccessOverrideSection schemaKey="access" />;
}
