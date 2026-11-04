---
title: Compliant on paper is not the same as compliant
author: Netability Singapore
author_title: IT Security, Cloud & MAS Compliance
date: 2026-12-03T01:45
category: Security insight
tags:
  - MAS Compliance
  - Cyber Hygiene
  - Cybersecurity
  - Compliance Assessment
image: /images/news/post-cyber-hygiene-reality-cover.png
cta_text: Check your real cyber hygiene posture
cta_link: mas-trm-compliance.html
---

Most companies we meet can pass a cyber hygiene review. Far fewer could pass an attack.

The reason is not dishonesty but how compliance gets measured. An audit asks for evidence, and evidence usually means documents: a policy, a procedure, a signed attestation, a screenshot from the day of the review. The documents are real. What they describe often isn’t, or isn’t any more.

The MAS Notice on Cyber Hygiene doesn’t ask whether you have a policy. It asks whether your systems are configured to meet the requirement. Those are different questions, and the space between them is where incidents happen.

Here is what that space typically looks like, domain by domain.

**Administrative accounts.** The policy says privileged access is reviewed quarterly. The domain still has the administrator account of an engineer who left two years ago, a shared local admin password reused across every workstation, and a “temporary” service account with domain admin rights.

**Security patches.** The policy sets a patching window. Servers are patched; firewalls, switches, the hypervisor and the backup appliance are not, because nobody owns them in the patching process.

**Security standards.** A hardening baseline was written and applied at build time. Nobody has measured drift since.

**Network perimeter defence.** Firewall rules are documented and approved. The rule base also holds an “any-any” rule added for a vendor during an outage and never removed.

**Malware protection.** Endpoint protection is deployed everywhere, according to the licence count. On a handful of machines the agent has stopped reporting, and nobody has noticed.

**Multi-factor authentication.** MFA is enforced, according to the policy. In practice, a Conditional Access exclusion group created “just for testing” still contains half the management team, and legacy authentication is still allowed on the mail tenant.

Every one of these firms would show a compliant document. None of them is compliant.

That is why we built our MAS Cyber Hygiene assessment to test the systems, not the paperwork. It covers 65 controls across all six domains of the Notice. Each control is checked against the live configuration and backed by evidence taken from the system itself. The result is a scored report showing where you actually stand: what is met, what isn’t, and what to fix first, in a form your board and your regulator can both use.

If the report matches your policies, good. You now have proof. If it doesn’t, you’ll find out from us instead of from an incident or an inspection.
