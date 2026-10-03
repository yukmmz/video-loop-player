// node tests/test_logic.js
//
// The app is one index.html on purpose (do not split it), so these checks read
// the inline <script> as text instead of importing modules:
//   - the whole script compiles (catches syntax errors before a deploy)
//   - the constant block (APP_VERSION / CHANGELOG / STRINGS) evaluates and is consistent
//   - every i18n key used in the HTML or the script exists in both languages
//   - sw.js caches files that exist, and both READMEs carry the current version
// The player itself (video element, swipe, full screen) is DOM-bound and is
// checked by hand in the browser, not here.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const html = read('index.html');

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failures++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}

// The app script is the last inline <script> (i18n.js is loaded by src).
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const appScript = scripts[scripts.length - 1];

check('inline script compiles', () => {
  new vm.Script(appScript, { filename: 'index.html <script>' });
});

// Constants live between APP_VERSION and the first use of I18N; evaluate just that slice.
const start = appScript.indexOf('const APP_VERSION');
const end = appScript.indexOf('const t = (key');
assert.ok(start > 0 && end > start, 'could not find the constant block in index.html');
const C = vm.runInNewContext(
  appScript.slice(start, end) + '\n;({ APP_VERSION, APP_URL, SRC_URL, CHANGELOG, STRINGS })');

check('APP_VERSION is x.y.z', () => {
  assert.match(C.APP_VERSION, /^\d+\.\d+\.\d+$/);
});

check('CHANGELOG starts with APP_VERSION and is newest first', () => {
  assert.strictEqual(C.CHANGELOG[0].version, C.APP_VERSION);
  const num = (v) => v.split('.').map(Number).reduce((a, n) => a * 1000 + n, 0);
  for (let i = 1; i < C.CHANGELOG.length; i++) {
    assert.ok(num(C.CHANGELOG[i - 1].version) > num(C.CHANGELOG[i].version),
      `${C.CHANGELOG[i - 1].version} should be newer than ${C.CHANGELOG[i].version}`);
  }
});

check('every changelog item has ja and en', () => {
  for (const e of C.CHANGELOG) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, `bad date in ${e.version}`);
    for (const it of e.items) assert.ok(it.ja && it.en, `missing translation in ${e.version}`);
  }
});

check('STRINGS has the same keys in ja and en', () => {
  const ja = Object.keys(C.STRINGS.ja).sort();
  const en = Object.keys(C.STRINGS.en).sort();
  assert.deepStrictEqual(ja.filter((k) => !en.includes(k)), [], 'keys only in ja');
  assert.deepStrictEqual(en.filter((k) => !ja.includes(k)), [], 'keys only in en');
});

check('every key used in the HTML exists', () => {
  const used = [...html.matchAll(/data-i18n(?:-html|-title|-aria-label|-placeholder)?="([^"]+)"/g)].map((m) => m[1]);
  const missing = [...new Set(used)].filter((k) => !(k in C.STRINGS.ja));
  assert.deepStrictEqual(missing, []);
});

check('every key used with t() in the script exists', () => {
  const used = [...appScript.matchAll(/\bt\('([\w.]+)'/g)].map((m) => m[1]);
  const missing = [...new Set(used)].filter((k) => !(k in C.STRINGS.ja));
  assert.deepStrictEqual(missing, []);
});

check('QR URLs point at this app', () => {
  assert.strictEqual(C.APP_URL, 'https://yukmmz.github.io/video-loop-player/');
  assert.strictEqual(C.SRC_URL, 'https://github.com/yukmmz/video-loop-player');
});

check('sw.js caches only files that exist', () => {
  const sw = read('sw.js');
  assert.match(sw, /const CACHE = 'video-loop-player-v\d+'/);
  const shell = sw.match(/const SHELL = \[([\s\S]*?)\]/)[1];
  const files = [...shell.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
  for (const f of files) assert.ok(fs.existsSync(path.join(ROOT, f.replace(/^\.\//, ''))), `${f} is missing`);
});

check('both READMEs show the current version and have a row for it', () => {
  for (const f of ['README.md', 'README_ja.md']) {
    const md = read(f);
    assert.ok(md.includes('v' + C.APP_VERSION), `${f}: current version line is not v${C.APP_VERSION}`);
    assert.ok(new RegExp('^\\| ' + C.APP_VERSION.replace(/\./g, '\\.') + ' \\|', 'm').test(md),
      `${f}: version table has no row for ${C.APP_VERSION}`);
  }
});

console.log(failures ? `\n${failures} FAILED` : '\nALL PASS');
process.exit(failures ? 1 : 0);
