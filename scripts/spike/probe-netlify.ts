/**
 * Stage 2 proof (P4, P5): reports how Netlify answers requests for the
 * redirect proof rules in public/_redirects, and a few other behaviours.
 *
 *   node scripts/spike/probe-netlify.ts https://deploy-preview-N--site.netlify.app
 *
 * Each odd character has two rules: one written raw in _redirects and one
 * written percent-encoded. Each is requested the way a browser sends it and
 * fully percent-encoded, to learn which combination Netlify matches.
 */
const base = process.argv[2]?.replace(/\/$/, '');
if (!base) {
  console.error('usage: probe-netlify.ts <deploy url>');
  process.exit(2);
}

const cases: [label: string, tail: string][] = [
  ['pipe', '|-pipe'],
  ['ampersand', 'q&a'],
  ['curly quote', 'aren’t'],
  ['comma', 'git-2.5,-x'],
  ['colon', 'up:-in'],
  ['apostrophe', "world's-best"],
  ['em dash', 'a-—-b'],
];

async function probe(path: string): Promise<string> {
  const res = await fetch(`${base}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'timbroder.com-smoke-test' },
  });
  const location = res.headers.get('location');
  return `${res.status}${location ? ` -> ${location.replace(base, '')}` : ''}`;
}

/** Percent-encode everything except unreserved characters and "/". */
const fullyEncoded = (path: string) =>
  path
    .split('/')
    .map((part) =>
      encodeURIComponent(part).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    )
    .join('/');

const row = (a: string, b: string, c: string) =>
  console.log(`${a.padEnd(22)} | ${b.padEnd(18)} | ${c}`);

row('rule in _redirects', 'request', 'answer');
for (const [label, tail] of cases) {
  for (const rule of ['raw', 'enc']) {
    const path = `/redirect-proof/${rule}-${tail}/`;
    row(`${label}, ${rule}`, 'as a browser sends', await probe(encodeURI(path)));
    row(`${label}, ${rule}`, 'fully encoded', await probe(fullyEncoded(path)));
  }
}
row('uppercase', 'as written', await probe('/redirect-proof/raw-Great-Series/'));
row('uppercase', 'lowercased', await probe('/redirect-proof/raw-great-series/'));
row('triple hyphen', 'as written', await probe('/redirect-proof/raw-a---b/'));
row('wildcard', '/2026/11/...', await probe('/2026/11/redirect-proof-wildcard/'));
row('wildcard', '/2031/02/...', await probe('/2031/02/redirect-proof-wildcard/'));

const feed = await fetch(`${base}/feed`);
row('/feed', 'content type', `${feed.status} ${feed.headers.get('content-type')}`);
row('/feed/', '', await probe('/feed/'));
row('/projects', 'no trailing slash', await probe('/projects'));
row('/nope/', 'unknown URL', await probe('/nope/'));
row(
  'page with "|" in URL',
  'as a browser sends',
  await probe(encodeURI('/2015/07/we-need-more-bad-ideas-|-manton-reece/')),
);

export {};
