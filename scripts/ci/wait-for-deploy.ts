/**
 * Waits until a deployed site is serving a given commit.
 *
 *   node scripts/ci/wait-for-deploy.ts <url> <commit sha> [timeout seconds]
 *
 * The home page carries the commit in <meta name="build-commit">. Without
 * this check the smoke tests could run against the previous deploy.
 *
 * A new deploy reaches Netlify's servers over a few seconds, and for that
 * time some requests still get the old answer. So one good response is not
 * enough: the commit has to be seen several times in a row.
 */
const [url, sha, timeout = '900'] = process.argv.slice(2);
if (!url || !sha) {
  console.error('usage: wait-for-deploy.ts <url> <commit sha> [timeout seconds]');
  process.exit(2);
}

const REQUIRED_IN_A_ROW = 6;
const base = url.replace(/\/$/, '');
const deadline = Date.now() + Number(timeout) * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function servesCommit(): Promise<string | true> {
  try {
    // No cache-busting query: the tests request the plain URL, so that is
    // the URL that has to be ready.
    const res = await fetch(`${base}/`, {
      headers: { 'user-agent': 'timbroder.com-smoke-test' },
    });
    const html = await res.text();
    const found = html.match(/<meta name="build-commit" content="([^"]*)"/)?.[1];
    if (res.ok && found === sha) return true;
    return `status ${res.status}, build-commit ${found ?? 'missing'}`;
  } catch (err) {
    return (err as Error).message;
  }
}

let inARow = 0;
let last = 'no response yet';

while (Date.now() < deadline) {
  const result = await servesCommit();
  if (result === true) {
    inARow++;
    if (inARow >= REQUIRED_IN_A_ROW) {
      console.log(`${base} is serving ${sha}`);
      process.exit(0);
    }
    await sleep(3_000);
  } else {
    if (inARow > 0) console.log(`lost the new deploy after ${inARow} good responses`);
    inARow = 0;
    last = result;
    await sleep(10_000);
  }
}

console.error(`Timed out waiting for ${base} to serve ${sha} (${last})`);
process.exit(1);

export {};
