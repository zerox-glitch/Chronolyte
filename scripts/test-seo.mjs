import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = 'dist';
const read = (file) => readFileSync(join(root,file), 'utf8');
const html = read('index.html');
const origin = 'https://www.chronolyteai.site';
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
assert.equal(canonical, origin + '/', 'canonical homepage URL differs from configured domain');
assert.match(html, /<main\b/i, 'homepage must include crawler-readable HTML');
assert.match(html, /<h1\b/i, 'homepage requires a meaningful heading');
assert.doesNotMatch(html, /<div id="loading-fallback"/, 'static build should replace the spinner with visible content');
for (const route of ['services','pricing','portfolio','contact','website-design','affordable-web-design','website-redesign','ai-automation','custom-software']) {
  const file = route + '/index.html';
  assert.ok(existsSync(join(root,file)), 'missing indexable route: ' + route);
  const page = read(file);
  assert.match(page, /<main\b/i, 'missing visible content at ' + route);
  assert.match(page, /<h1\b/i, 'missing heading at ' + route);
  assert.ok(page.includes(origin + '/' + route), 'wrong route canonical: ' + route);
}
const robots = read('robots.txt');
for(const agent of ['OAI-SearchBot','ChatGPT-User','GPTBot','Claude-SearchBot','Claude-User','PerplexityBot','Googlebot','Bingbot']) {
  assert.ok(robots.includes('User-agent: ' + agent), 'missing search crawler: ' + agent);
}
assert.ok(robots.includes('Sitemap: ' + origin + '/sitemap.xml'));
const sitemap=read('sitemap.xml');
for(const route of ['website-design','affordable-web-design','website-redesign','ai-automation','custom-software']) {
  assert.ok(sitemap.includes(origin + '/' + route + '</loc>'), 'missing sitemap service route: '+route);
}
assert.ok(read('llms.txt').includes(origin));
console.log('[seo] canonical, visible HTML, commercial pages, sitemap and AI-crawler policies verified');
