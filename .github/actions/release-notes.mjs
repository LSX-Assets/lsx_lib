// Release notes and CHANGELOG.md for the version being released.
//
//   NEW_VERSION=1.0.4 PREV_TAG=v1.0.3 node .github/actions/release-notes.mjs
//
// The changelog is written once, as JSON, in LSX-Assets/lsx_publicInfo
// (changelogs/lsx_lib.json), and rendered by that repo's render.mjs, so the
// notes on the release, the CHANGELOG.md in the zip and the in-game changelog
// page are the same text.
//
// A push must always release, so a missing entry is not an error here: the
// notes fall back to the commits since the previous release and CHANGELOG.md
// keeps whatever the repo has.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const version = process.env.NEW_VERSION;
const prevTag = process.env.PREV_TAG || '';
const BASE = 'https://raw.githubusercontent.com/LSX-Assets/lsx_publicInfo/main';

if (!version) {
  console.error('NEW_VERSION is not set');
  process.exit(1);
}

async function fromPublicInfo() {
  try {
    const [docRes, rendererRes] = await Promise.all([
      fetch(`${BASE}/changelogs/lsx_lib.json`),
      fetch(`${BASE}/render.mjs`),
    ]);
    if (!docRes.ok || !rendererRes.ok) return null;

    const doc = await docRes.json();
    const entry = doc.entries?.find((e) => e.version === version);
    if (!entry) return null;

    const rendererPath = path.join(tmpdir(), 'lsx-render.mjs');
    writeFileSync(rendererPath, await rendererRes.text());
    const { renderDoc, renderEntry } = await import(pathToFileURL(rendererPath).href);

    writeFileSync('CHANGELOG.md', renderDoc(doc));
    // The release page has its own title, so drop the entry's heading line.
    return renderEntry(entry).split('\n').slice(1).join('\n').trim();
  } catch (err) {
    console.log(`publicInfo unavailable (${err.message})`);
    return null;
  }
}

function fromCommits() {
  const range = prevTag ? [`${prevTag}..HEAD`] : ['HEAD'];
  const log = execFileSync('git', ['log', '--no-merges', '--format=%h%x09%s', ...range], { encoding: 'utf8' });
  const lines = log
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter(([, subject]) => !/^chore: bump manifest version/i.test(subject))
    .slice(0, 40)
    .map(([sha, subject]) => `- ${subject} (${sha})`);
  return lines.length ? `## Changes\n\n${lines.join('\n')}` : 'No changes since the previous release.';
}

const written = await fromPublicInfo();
const body = written ?? fromCommits();
const footer = '\n\nDownload `lsx_lib.zip` below, or always the newest from '
  + 'https://github.com/LSX-Assets/lsx_lib/releases/latest/download/lsx_lib.zip';

writeFileSync('release-notes.md', body + footer + '\n');
console.log(written ? `Notes from lsx_publicInfo for ${version}` : `No publicInfo entry for ${version}; notes from the commits`);
