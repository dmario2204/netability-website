// Reads every Markdown file in content/news/ and bundles them into a single
// posts.json file at the repo root. This runs automatically via GitHub Actions
// whenever a post is published in the CMS — visitors then load posts.json from
// your own site instead of calling GitHub, so the Posts page can never be
// rate-limited.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const NEWS_DIR = 'content/news';
const OUT_FILE = 'posts.json';

const filenames = (await readdir(NEWS_DIR)).filter((f) => f.endsWith('.md'));

const posts = [];
for (const filename of filenames) {
  const raw = await readFile(path.join(NEWS_DIR, filename), 'utf8');
  const { data, content } = matter(raw); // data = front-matter, content = body

  posts.push({
    ...data, // title, author, author_title, category, tags, image, cta_text, cta_link, ...
    date: data.date ? new Date(data.date).toISOString() : null,
    body: content.trim(),
    _file: filename, // used only for sorting; removed before writing
  });
}

// Newest first. Filenames start with YYYY-MM-DD, so they work as a fallback.
const sortKey = (p) => p.date || p._file || '';
posts.sort((a, b) => {
  const ka = sortKey(a);
  const kb = sortKey(b);
  return ka < kb ? 1 : ka > kb ? -1 : 0;
});
for (const p of posts) delete p._file;

await writeFile(OUT_FILE, JSON.stringify(posts, null, 2) + '\n');
console.log(`Built ${OUT_FILE} with ${posts.length} post(s).`);
