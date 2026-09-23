---
title: Your AI agents hold credentials — do you know what they can reach?
author: Netability Singapore
author_title: IT Security, Cloud & MAS Compliance
date: 2026-10-06T09:50
category: Security insight
tags:
  - AI Risk · Cybersecurity · Zero Trust · Ai agent
image: /images/news/pasted-image-1790157562819.png
cta_text: Review your AI agent access
cta_link: cybersecurity.html
---

For two years the question about AI was what a model might say. That question has moved on. Agents now act — reading mail, querying systems, calling APIs, making changes. They hold credentials. The risk is no longer a bad answer; it is an unauthorised action taken at machine speed.

The attack that exploits this is indirect prompt injection: instructions hidden inside something the agent reads rather than something a user types. A line buried in a supplier invoice, a support ticket, a web page the agent was asked to summarise. Nobody sees it. The agent follows it, using whatever access it was given. Security researchers now report these indirect attacks as the majority of prompt injection incidents, and as materially more successful than the direct kind.

Gartner's warning this year is worth repeating: applying uniform governance across every agent, regardless of its autonomy and scope, is itself a cause of failure. What matters is the distinction between what an agent is able to do and how far its access reaches. Gartner also expects more than four in ten agentic projects to be abandoned — often because autonomy was granted before anyone defined the boundaries.

The gap we see most often is simple. Agents get deployed without identities. No named service account, no least-privilege scoping, no audit trail of what the agent did and on whose behalf. The controls any firm would insist on for a human administrator go unapplied to a process that works faster and never pauses.

For Singapore firms, MAS's Guidelines on AI Risk Management are still in consultation, but the proposed text covers autonomous agents explicitly, and MAS has already published an AI Risk Management Operationalisation Handbook with 24 banks, insurers and capital markets firms through Project MindForge. There is enough direction to act on now.

Three things worth doing before a pilot becomes production: give every agent its own identity, scope its access to the minimum it genuinely needs, and log its actions somewhere you will actually review. None of that waits on the guidelines being finalised.

We help firms in Singapore apply the identity, segmentation and monitoring controls that make agent deployments defensible. If you are piloting agents, it is worth knowing what they can reach.
