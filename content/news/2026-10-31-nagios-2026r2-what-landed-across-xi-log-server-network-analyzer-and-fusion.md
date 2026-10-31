---
title: 'Nagios 2026R2: what landed across XI, Log Server, Network Analyzer and Fusion'
author: Netability Singapore
author_title: IT Security, Cloud & MAS Compliance
date: 2026-11-02T01:00
category: Partner news
tags:
  - Nagios
  - Network Monitoring
  - Partner News
image: /images/news/Oct-R2-webinar-website-1200x630.png
cta_text: Talk to us about your Nagios upgrade
cta_link: network-monitoring.html
---

Nagios has published the on-demand recording of its 2026R2 round-up webinar, held on 29 October. It walks through the September releases across all four commercial products, and it is the fastest way to see what changed without reading four changelogs.

The highlights, in the order they matter to most estates.

**Nagios XI** gains a Wizard Builder and expanded role-based access control. The Wizard Builder is the interesting one for anyone monitoring systems that do not come with an off-the-shelf check — it brings custom monitoring closer to something a team can maintain itself rather than a one-off script nobody wants to touch.

**Network Analyzer** adds a Suricata dashlet and multi-interface Wireshark scans. Putting IDS signal next to flow data in the same console closes a gap that usually means correlating two tools by hand during an incident.

**Log Server** adds OpenSearch disk usage alerting. Unglamorous, and probably the single most valuable item on this list. A log pipeline that quietly stops ingesting is worse than no pipeline, because nobody notices until the day the logs are needed — and for firms with retention obligations, that day tends to be an inconvenient one.

**Fusion** received the heaviest overhaul, including the new event-based collection method for XI, Log Server and Network Analyzer, so the console reflects state as it changes rather than at the next poll. We covered the Fusion rebuild in more detail in September.

If you are running any of these in production, the upgrade path is worth planning rather than improvising, particularly where you depend on custom checks, event handlers or tuned alerting. We design, deploy and support Nagios across Singapore and can advise on what a 2026R2 upgrade means for your specific configuration.

[Watch the webinar recording on nagios.com](https://www.nagios.com/webinar/all-the-r2s-whats-new-whats-in-nagios-2026r2/)
