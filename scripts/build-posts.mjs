// Builds two things from the Markdown files in content/news/:
//
//   1. posts.json          — the feed data used by posts.html
//   2. posts/<slug>.html   — one shareable page per post, each with its own
//                            title, description and preview image, so links
//                            shared to LinkedIn and X show the right card.
//
// Runs automatically via GitHub Actions whenever a post is published in the CMS.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const SITE      = 'https://www.netability.sg';
const NEWS_DIR  = 'content/news';
const OUT_JSON  = 'posts.json';
const OUT_DIR   = 'posts';

// ── helpers ─────────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Combining accent marks (U+0300-U+036F), built from a plain ASCII string so
// no unusual characters ever appear in this source file.
const ACCENT_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

// "2026-08-25-mas-cyber-hygiene.md" -> "mas-cyber-hygiene"
// Strips the date prefix, then reduces everything to plain a-z0-9 and hyphens
// so the URL stays clean when shared. Em-dashes, accents, apostrophes and any
// other punctuation the CMS leaves in a filename all collapse to hyphens.
function baseSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .normalize('NFKD')             // separate accents from their letters
    .replace(ACCENT_MARKS, '')     // drop the accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')   // anything else becomes a hyphen
    .replace(/-+/g, '-')           // collapse runs of hyphens
    .replace(/^-|-$/g, '');        // trim hyphens from the ends
}

// Cover images are stored by the CMS as "/images/news/x.png" (absolute).
// Older posts may use "images/x.png" (relative to site root). Post pages live
// one level down in /posts/, so relative paths need "../".
function assetPath(p) {
  if (!p) return '';
  return p.startsWith('/') || /^https?:\/\//.test(p) ? p : '../' + p;
}

function absoluteUrl(p) {
  if (!p) return `${SITE}/images/og-image.jpg`;
  if (/^https?:\/\//.test(p)) return p;
  return SITE + (p.startsWith('/') ? p : '/' + p);
}

// Same Markdown subset the feed supports: headings, bold, links, lists.
function mdToHtml(md) {
  const lines = String(md || '').split('\n');
  let html = '', inList = false;
  const inline = (t) => esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline(line.replace(/^\s*-\s+/, '')) + '</li>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (/^###\s+/.test(line))      html += '<h4>' + inline(line.replace(/^###\s+/, '')) + '</h4>';
      else if (/^##\s+/.test(line))  html += '<h3>' + inline(line.replace(/^##\s+/, ''))  + '</h3>';
      else if (line.trim() === '')   { /* skip */ }
      else                           html += '<p>' + inline(line) + '</p>';
    }
  }
  if (inList) html += '</ul>';
  return html;
}

// First real paragraph, stripped of Markdown, for the meta description.
function excerpt(body, limit = 155) {
  const first = String(body || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('-') && !l.startsWith('#')) || '';
  const clean = first
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return clean.length > limit ? clean.slice(0, limit - 1).trimEnd() + '…' : clean;
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── read the posts ──────────────────────────────────────────────────────────

const filenames = (await readdir(NEWS_DIR)).filter((f) => f.endsWith('.md'));

const posts = [];
const usedSlugs = new Set();

for (const filename of filenames) {
  const raw = await readFile(path.join(NEWS_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  // Keep the date prefix only if two posts would otherwise share a slug.
  let slug = baseSlug(filename);
  if (!slug) slug = 'post';
  if (usedSlugs.has(slug)) slug = baseSlug(filename.replace(/\.md$/, '') + '-' + usedSlugs.size);
  usedSlugs.add(slug);

  posts.push({
    ...data,
    date: data.date ? new Date(data.date).toISOString() : null,
    body: content.trim(),
    slug,
    url: `/${OUT_DIR}/${slug}.html`,
    _file: filename,
  });
}

// Newest first. Filenames start with YYYY-MM-DD, so they work as a fallback.
const sortKey = (p) => p.date || p._file || '';
posts.sort((a, b) => {
  const ka = sortKey(a), kb = sortKey(b);
  return ka < kb ? 1 : ka > kb ? -1 : 0;
});
for (const p of posts) delete p._file;

await writeFile(OUT_JSON, JSON.stringify(posts, null, 2) + '\n');

// ── build one page per post ─────────────────────────────────────────────────

await rm(OUT_DIR, { recursive: true, force: true });   // drop pages for deleted posts
await mkdir(OUT_DIR, { recursive: true });

const NAV = `
<nav>
  <div class="nav-inner">
    <div class="nav-logo" onclick="window.location.href='../index.html'">
      <img id="logo-nav" src="../images/logo.png" alt="Netability Singapore">
    </div>
    <div class="nav-links">
      <a class="nav-link" href="../index.html">Home</a>
      <a class="nav-link active" href="../posts.html">Posts</a>
      <a class="nav-link" href="../tools.html">Tools</a>
      <a class="nav-link" href="../about.html">About Us</a>
      <a class="nav-link" href="../contact.html">Contact</a>
    </div>
    <button class="nav-cta" onclick="window.location.href='../contact.html'">Free Assessment</button>
    <div class="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a class="nav-link" href="../index.html">Home</a>
  <a class="nav-link" href="../posts.html">Posts</a>
  <a class="nav-link" href="../tools.html">Tools</a>
  <a class="nav-link" href="../about.html">About Us</a>
  <a class="nav-link" href="../contact.html">Contact</a>
  <button class="nav-cta" onclick="window.location.href='../contact.html'">Get a Free Assessment</button>
</div>`;

const FOOTER = `
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div>
        <div class="footer-logo"><img id="logo-footer" src="../images/logo-white.png" alt="Netability"></div>
        <p class="footer-desc">Swiss-born IT services company with offices in Singapore and Hong Kong. Specialists in MAS TRM compliance, Microsoft cloud, cybersecurity and managed IT since 2003.</p>
        <div class="footer-social">
          <a href="https://www.linkedin.com/company/netability-singapore-pte-ltd" target="_blank" rel="noopener" aria-label="Netability Singapore on LinkedIn"><svg viewBox="0 0 24 24"><use href="#icon-linkedin"/></svg></a>
          <a href="https://x.com/Netability13" target="_blank" rel="noopener" aria-label="Netability Singapore on X"><svg viewBox="0 0 24 24"><use href="#icon-x"/></svg></a>
        </div>
      </div>
      <div class="footer-col"><h5>Solutions</h5><a href="../microsoft-cloud.html">Microsoft Cloud</a><a href="../mas-trm-compliance.html">IT &amp; MAS Compliance</a><a href="../voice-recording.html">Voice Recording</a><a href="../network-monitoring.html">Network Monitoring</a><a href="../cybersecurity.html">Cybersecurity</a></div>
      <div class="footer-col"><h5>Company</h5><a href="../about.html">About Us</a><a style="cursor:default;pointer-events:none">UEN: 200614711H</a><a href="../contact.html">Contact Us</a><a href="mailto:info@netability.sg">info@netability.sg</a></div>
      <div class="footer-col"><h5>Singapore Office</h5><a href="tel:+6568173611">+65 6817 3611</a><a href="https://www.google.com/maps/search/?api=1&amp;query=883+North+Bridge+Road+Southbank+Singapore+198785" target="_blank" rel="noopener" aria-label="Open our Singapore office in Google Maps">883 North Bridge Road<br>Southbank #05-04<br>Singapore 198785</a></div>
    </div>
    <hr class="footer-divider">
    <div class="footer-bottom"><p>&copy; 2026 Netability (Singapore) Pte Ltd &middot; UEN 200614711H &middot; <a href="../legal/privacy-policy.pdf" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Privacy Policy</a></p><p>Swiss-founded &middot; Singapore-based &middot; MAS TRM Specialists</p></div>
  </div>
</footer>`;

const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="icon-arrow-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 17 17 7"/><polyline points="7 7 17 7 17 17"/></symbol>
  <symbol id="icon-linkedin" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></symbol>
  <symbol id="icon-x" viewBox="0 0 24 24"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z"/></symbol>
</svg>`;

function page(p) {
  const url      = `${SITE}${p.url}`;
  const desc     = excerpt(p.body);
  const ogImage  = absoluteUrl(p.image);
  const cover    = p.image
    ? `<img class="post-image" src="${esc(assetPath(p.image))}" alt="" style="border-radius:12px;margin:1.6rem 0">`
    : '';
  const tags = (p.tags || []).length
    ? `<div class="post-tags" style="padding:1.4rem 0 0">${(p.tags || []).map((t) => `<span class="post-tag">${esc(t)}</span>`).join('')}</div>`
    : '';
  const cta = (p.cta_text && p.cta_link)
    ? `<a class="btn-primary" style="display:inline-block;text-decoration:none;margin-top:1.6rem" href="${esc(assetPath(p.cta_link))}">${esc(p.cta_text)}</a>`
    : '';

  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const shareX        = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title || '')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)} &mdash; Netability Singapore</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
<meta property="og:site_name" content="Netability Singapore">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="628">
${p.date ? `<meta property="article:published_time" content="${esc(p.date)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/styles.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":${JSON.stringify(p.title || '')},"description":${JSON.stringify(desc)},"image":${JSON.stringify(ogImage)},"datePublished":${JSON.stringify(p.date || '')},"author":{"@type":"Organization","name":"Netability (Singapore) Pte Ltd"},"publisher":{"@type":"Organization","name":"Netability (Singapore) Pte Ltd","logo":{"@type":"ImageObject","url":"${SITE}/images/logo.png"}},"mainEntityOfPage":${JSON.stringify(url)}}
</script>
</head>
<body>
${SPRITE}
${NAV}

<section class="page-hero">
  <div class="page-hero-inner">
    <button class="back-btn" onclick="window.location.href='../posts.html'">Back to posts</button>
    ${p.category ? `<div class="page-badge" style="background:rgba(85,39,222,0.15);border:1px solid rgba(85,39,222,0.3);color:#C5B8F2">${esc(p.category)}</div>` : ''}
    <h1>${esc(p.title)}</h1>
    <p class="tagline">${esc(p.author || 'Netability Singapore')}${p.date ? ` &middot; ${esc(fmtDate(p.date))}` : ''}</p>
  </div>
</section>

<article class="inner-page" style="max-width:760px">
  ${cover}
  <div class="post-body" style="padding:0">
    ${mdToHtml(p.body)}
  </div>
  ${cta}
  ${tags}

  <div style="display:flex;align-items:center;gap:0.7rem;margin-top:2.4rem;padding-top:1.4rem;border-top:1px solid var(--border)">
    <span style="font-size:0.8rem;color:var(--slate);font-weight:600">Share</span>
    <a href="${esc(shareLinkedIn)}" target="_blank" rel="noopener" aria-label="Share on LinkedIn"
       style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:var(--bg2);border:1px solid var(--border)">
      <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--slate)"><use href="#icon-linkedin"/></svg></a>
    <a href="${esc(shareX)}" target="_blank" rel="noopener" aria-label="Share on X"
       style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:var(--bg2);border:1px solid var(--border)">
      <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:var(--slate)"><use href="#icon-x"/></svg></a>
    <button id="copy-link" style="font-size:0.8rem;font-weight:600;color:var(--brand);background:var(--brand-dim);border:none;padding:0.5rem 0.9rem;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif">Copy link</button>
  </div>
</article>

${FOOTER}
<script src="../js/main.js"></script>
<script>
document.getElementById('copy-link').addEventListener('click', function(){
  var btn = this;
  navigator.clipboard.writeText(${JSON.stringify(url)}).then(function(){
    var old = btn.textContent; btn.textContent = 'Copied';
    setTimeout(function(){ btn.textContent = old; }, 1600);
  });
});
</script>
</body>
</html>
`;
}

let built = 0;
for (const p of posts) {
  await writeFile(path.join(OUT_DIR, `${p.slug}.html`), page(p));
  built++;
}

console.log(`Built ${OUT_JSON} with ${posts.length} post(s), and ${built} page(s) in ${OUT_DIR}/.`);