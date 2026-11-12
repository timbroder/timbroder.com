/**
 * Waits until a deployed site is serving a given commit.
 *
 *   node scripts/ci/wait-for-deploy.ts <url> <commit sha> [timeout seconds]
 *
 * The home page carries the commit in <meta name="build-commit">. Without
 * this check the smoke tests could run against the previous deploy.
 */
const [url, sha, timeout = '900'] = process.argv.slice(2);
if (!url || !sha) {
  console.error('usage: wait-for-deploy.ts <url> <commit sha> [timeout seconds]');
  process.exit(2);
}

const deadline = Date.now() + Number(timeout) * 1000;
let last = 'no response yet';

while (Date.now() < deadline) {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/?t=${Date.now()}`, {
      headers: { 'user-agent': 'timbroder.com-smoke-test' },
    });
    const html = await res.text();
    const found = html.match(/<meta name="build-commit" content="([^"]*)"/)?.[1];
    last = `status ${res.status}, build-commit ${found ?? 'missing'}`;
    if (res.ok && found === sha) {
      console.log(`${url} is serving ${sha}`);
      process.exit(0);
    }
  } catch (err) {
    last = (err as Error).message;
  }
  await new Promise((r) => setTimeout(r, 10_000));
}

console.error(`Timed out waiting for ${url} to serve ${sha} (${last})`);
process.exit(1);

export {};
