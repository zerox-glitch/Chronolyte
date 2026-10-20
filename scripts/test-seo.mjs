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
for (const route of ['international-web-development','services','pricing','portfolio','contact','website-design','affordable-web-design','website-redesign','ai-automation','custom-software']) {
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
assert.ok(read('llms.txt').includes('United Kingdom'), 'worldwide area must appear in LLM context');
assert.ok(sitemap.includes(origin + '/international-web-development</loc>'), 'international page missing from sitemap');

// Answer-focused editorial content must be directly retrievable and discoverable.
for (const slug of [
  'best-website-development-service-for-small-business-on-a-budget',
  'what-does-a-499-dollar-business-website-include',
  'how-to-compare-fast-web-design-agencies'
]) {
  const article = read('blog/' + slug + '/index.html');
  assert.match(article, /<h1\b/i, 'answer guide missing heading: ' + slug);
  assert.ok(article.includes(origin + '/blog/' + slug), 'wrong guide canonical: ' + slug);
  assert.ok(sitemap.includes(origin + '/blog/' + slug + '</loc>'), 'guide not listed in sitemap: ' + slug);
}

const articleCovers = [
  ['affordable-website-design-agency-vs-freelancer-vs-diy-2026', 'agency-freelancer-diy'],
  ['48-hour-website-vs-7-day-website-what-you-get', '48-hours-vs-7-days'],
  ['chronolyte-vs-wix-squarespace-fiverr-small-business-website', 'chronolyte-vs-builders'],
  ['best-website-development-service-for-small-business-on-a-budget', 'choose-web-developer'],
  ['what-does-a-499-dollar-business-website-include', '499-website'],
  ['how-to-compare-fast-web-design-agencies', 'compare-fast-agencies'],
];
for (const [slug, cover] of articleCovers) {
  const filename = 'images/blog/' + cover + '.webp';
  const bytes = readFileSync(join(root, filename));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', 'invalid WebP header: ' + filename);
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', 'invalid WebP format: ' + filename);
  const article = read('blog/' + slug + '/index.html');
  assert.ok(article.includes('/' + filename), 'missing featured WebP in prerendered article: ' + slug);
  assert.ok(!article.includes('/images/blog/' + cover + '.svg'), 'stale SVG image: ' + slug);
}

console.log('[seo] canonical, visible HTML, commercial pages, sitemap and AI-crawler policies verified');
