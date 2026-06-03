# Netability Singapore — Website

## Multi-Page Deployment Package

This is a traditional multi-page website. Each page is a separate HTML file
with its own URL — better for SEO, easier to edit individually.

### File structure

| URL                            | File                          | Page              |
|--------------------------------|-------------------------------|-------------------|
| /                              | index.html                    | Home              |
| /microsoft-cloud.html          | microsoft-cloud.html          | Microsoft Cloud   |
| /mas-trm-compliance.html       | mas-trm-compliance.html       | MAS TRM           |
| /voice-recording.html          | voice-recording.html          | Voice Recording   |
| /network-monitoring.html       | network-monitoring.html       | Network Monitor.  |
| /cybersecurity.html            | cybersecurity.html            | Cybersecurity     |
| /about.html                    | about.html                    | About Us          |
| /contact.html                  | contact.html                  | Contact           |

### Supporting files

| File           | Purpose                                            |
|----------------|----------------------------------------------------|
| sitemap.xml    | Google Search Console sitemap (8 URLs)             |
| robots.txt     | Crawler instructions                               |
| _headers       | Cloudflare security headers                        |
| _redirects     | Cloudflare URL redirect rules                      |

### Editing pages
Each HTML file is independent. Edit any one without affecting others.
The shared nav, footer, logo and stylesheet are duplicated in each file —
when you make a global change, update all 8 files.

### After upload to GitHub → Cloudflare deploy
1. Connect netability.sg domain in Cloudflare Pages
2. Submit https://www.netability.sg/sitemap.xml to Google Search Console
3. Verify at https://search.google.com/search-console

UEN: 200614711H
© 2025 Netability (Singapore) Pte Ltd
