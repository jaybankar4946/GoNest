const base = (process.env.BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Set BASE_URL to a Vercel Preview URL, for example https://gonest-preview.vercel.app');
  process.exit(2);
}

const routes = [
  ['home', '/', [200]],
  ['search', '/search', [200]],
  ['buy', '/buy', [200]],
  ['rent', '/rent', [200]],
  ['projects', '/projects', [200]],
  ['auth', '/auth', [200]],
  ['privacy', '/privacy', [200]],
  ['terms', '/terms', [200]],
  ['demo inventory', '/demo-inventory', [200]],
  ['invalid property ID', '/property/not-a-valid-uuid', [404]],
];

let failed = 0;
for (const [name, path, expected] of routes) {
  try {
    const response = await fetch(new URL(path, base), { redirect: 'manual' });
    const ok = expected.includes(response.status);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${response.status} ${path}`);
    if (!ok) failed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  console.error(`\n${failed} route smoke check(s) failed.`);
  process.exit(1);
}
console.log('\nAll route smoke checks passed.');
