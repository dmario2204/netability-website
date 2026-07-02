# Netability CMS — Setup Guide (Microsoft Entra ID login)

This guide sets up the **Posts** content manager at `yoursite/admin/` so your team logs
in with their **Microsoft 365 / Entra ID** accounts.

## How it works (read this first — 2 minutes)

There are **two separate jobs** the login has to do, and this is the key thing to understand:

1. **"Who are you, and are you allowed in?"** — handled by **Cloudflare Access + Entra ID.**
   Your team signs in with their Microsoft work account. Only people you approve can even
   reach the `/admin` page. This is where Entra ID lives.

2. **"Save this post to the website."** — handled by a small **Cloudflare Worker + GitHub.**
   The CMS ultimately has to commit the post file into your GitHub repo, and GitHub only
   accepts its own tokens. The Worker quietly brokers that GitHub connection.

So the flow your team experiences is:

```
Team member → visits /admin
           → Cloudflare Access stops them, asks for Microsoft login  ← Entra ID here
           → they sign in with M365, Access checks they're on the allow-list
           → CMS loads, they write a post
           → Worker commits it to GitHub → Cloudflare rebuilds the site
```

They only ever *see* the Microsoft login. The GitHub part is invisible plumbing you set up once.

> **Why not "Entra ID all the way"?** Decap/GitHub-backed CMS must commit with a GitHub
> token — there is no way around the GitHub piece. But by putting Cloudflare Access
> (with Entra ID) *in front*, your team never manages GitHub logins; access is controlled
> entirely by your Microsoft directory. This is the cleanest Microsoft-centric setup.

There are **three parts**. Do them in order. Budget ~45 minutes the first time.

- **Part A** — GitHub OAuth app + the Worker (the "save to GitHub" plumbing)
- **Part B** — Cloudflare Access + Entra ID (the "who's allowed in" gate)
- **Part C** — point the CMS at the Worker and test

You need: admin access to your **Cloudflare** account, your **GitHub** account
(`dmario2204`), and someone with **Entra ID app-registration rights** in your Microsoft
tenant (Cloud Application Administrator or higher). If that's not you, you'll need your
IT/M365 admin for Part B.

---

## PART A — GitHub OAuth app + the Worker

This gives the CMS a way to commit posts to your repo.

### A1. Create a GitHub OAuth app

1. Go to **github.com** → your profile photo → **Settings**
2. Bottom of the left menu → **Developer settings**
3. **OAuth Apps** → **New OAuth App**
4. Fill in:
   - **Application name:** `Netability CMS`
   - **Homepage URL:** `https://www.netability.sg` (or your `.pages.dev` URL for now)
   - **Authorization callback URL:** leave as `https://www.netability.sg` for the moment —
     you'll correct this in step A4 once you know the Worker URL
5. Click **Register application**
6. On the next screen:
   - Copy the **Client ID** — save it somewhere
   - Click **Generate a new client secret** → copy the **secret** immediately
     (you can't see it again). Save it.

### A2. Deploy the OAuth Worker (one click)

There is a maintained open-source Worker that does exactly this job.

1. Open **github.com/sterlingwes/decap-proxy** (or `trietng/cms-auth` — both work)
2. Follow its **"Deploy to Cloudflare"** button, OR deploy manually:
   - In **Cloudflare dashboard** → **Workers & Pages** → **Create** → **Create Worker**
   - Name it `netability-cms-auth`
   - Deploy the default, then **Edit code**, paste the Worker's `index.js` from the repo,
     and **Deploy**
3. After deploy, Cloudflare shows the Worker URL, like:
   `https://netability-cms-auth.<your-subdomain>.workers.dev`
   **Copy this URL — you'll need it twice.**

### A3. Give the Worker its secrets

1. In **Cloudflare** → **Workers & Pages** → click `netability-cms-auth`
2. **Settings** → **Variables and Secrets** (or **Variables**)
3. Add two **encrypted** variables:
   - `GITHUB_CLIENT_ID` = the Client ID from A1
   - `GITHUB_CLIENT_SECRET` = the secret from A1
4. (Optional but recommended) add:
   - `ALLOWED_DOMAINS` = `netability.sg` (and your `.pages.dev` host, comma-separated)
5. **Save and deploy**

### A4. Fix the GitHub callback URL

1. Back in **GitHub → Settings → Developer settings → OAuth Apps → Netability CMS**
2. Set **Authorization callback URL** to your Worker URL **+ `/callback`**:
   `https://netability-cms-auth.<your-subdomain>.workers.dev/callback`
3. **Update application**

Part A done. The CMS can now commit to GitHub. But right now *anyone* could reach
`/admin` — Part B locks it to your team.

---

## PART B — Cloudflare Access + Entra ID (the Microsoft login gate)

This makes `/admin` require a Microsoft 365 sign-in, limited to people you approve.

### B1. Register Cloudflare in Entra ID

*(Needs Entra admin rights. Hand this section to your M365 admin if that's not you.)*

1. Go to **entra.microsoft.com** (Microsoft Entra admin center)
2. **Identity → Applications → App registrations → New registration**
3. **Name:** `Cloudflare Access`
4. Under **Redirect URI**, choose **Web** and enter:
   `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
   - You'll find `<your-team-name>` in Cloudflare Zero Trust → **Settings** →
     it's your "team domain". If you haven't set one, Cloudflare will prompt you to
     pick one the first time you open Zero Trust.
5. **Register**
6. On the app's **Overview** page, copy:
   - **Application (client) ID**
   - **Directory (tenant) ID**
7. Left menu → **Certificates & secrets** → **New client secret** →
   name it, pick an expiry (note the date — you'll re-do this when it expires) →
   copy the secret **Value** (not the ID).
8. Left menu → **API permissions** → **Add a permission** → **Microsoft Graph** →
   **Delegated** → add `email`, `openid`, `profile`, and `User.Read` →
   **Grant admin consent**.

### B2. Add Entra ID as a login method in Cloudflare

1. **Cloudflare dashboard** → **Zero Trust** (opens the Cloudflare One dashboard)
   - If first time: it asks you to choose a **team name** and a free plan — the free
     plan covers up to 50 users, plenty for your team.
2. **Settings** → **Authentication** → **Login methods** → **Add new**
3. Choose **Microsoft Entra ID** (may still be labelled "Azure AD")
4. Enter:
   - **Application (Client) ID** — from B1
   - **Application Secret** — the secret Value from B1
   - **Directory (Tenant) ID** — from B1
   - Turn **Support groups** ON if you want to allow by Entra group later
5. **Save**, then **Test** — a Microsoft login window should appear and return
   "Your connection works."

### B3. Protect the /admin path with an Access application

1. In **Zero Trust** → **Access** → **Applications** → **Add an application**
2. Choose **Self-hosted**
3. **Application name:** `Netability CMS Admin`
4. **Session duration:** e.g. 24 hours
5. Under **Application domain**, enter your site and path:
   - Domain: `www.netability.sg` (or your `.pages.dev` host)
   - Path: `admin`
   (Add a second application entry for the `.pages.dev` host too if you use both.)
6. **Identity providers:** select **Microsoft Entra ID** (turn off the others if you only
   want Microsoft). Optionally enable **instant auth** so users skip the chooser screen.
7. **Next** → add a **policy**:
   - **Policy name:** `Netability team`
   - **Action:** Allow
   - **Include** rule — pick one:
     - **Emails ending in** `@netability.sg` (simplest), or
     - **Emails** — list specific addresses, or
     - **Entra ID groups** — if you enabled groups in B2
8. **Next** → **Add application**

Now anyone hitting `/admin` is forced through Microsoft login and must match your policy.

---

## PART C — Point the CMS at the Worker and test

### C1. Update the CMS config

In your repo, edit **`admin/config.yml`** — add the `base_url` line under `backend:` so it
points at your Worker from Part A:

```yaml
backend:
  name: github
  repo: dmario2204/netability-website
  branch: main
  base_url: https://netability-cms-auth.<your-subdomain>.workers.dev
```

Commit and push (Cloudflare redeploys in ~60s).

### C2. Test the whole flow

1. Open an **incognito window** → go to `https://www.netability.sg/admin/`
2. You should be redirected to **Microsoft login** (Cloudflare Access + Entra ID)
3. Sign in with a team M365 account that matches your policy
4. The **CMS loads** → click **Login with GitHub** (this uses the Worker; it may be
   automatic/quick since the Worker holds the app credentials)
5. You should see the **Posts** collection → **New Posts** → write a test post → **Publish**
6. Check your GitHub repo — a new file appears in `content/news/`
7. Cloudflare redeploys — but note: **new posts are markdown files; they won't appear on
   `posts.html` automatically yet.** See the note below.

---

## Important note — connecting posts to the page

Right now `posts.html` has its posts written directly in the HTML (the sample posts).
The CMS saves new posts as **markdown files** in `content/news/`. To make CMS posts show
up on `posts.html` automatically, the site needs a **build step** that turns those markdown
files into HTML on each deploy.

Two ways to handle this:

- **Option 1 — Keep it manual (simplest).** Use the CMS to draft and store posts, then
  copy the text into `posts.html` using the post template block. The CMS becomes your
  writing + storage tool; you paste the final version in. No build step needed.

- **Option 2 — Add a static site generator (fully automatic).** Introduce a lightweight
  build (e.g. **Eleventy/11ty**) that reads `content/news/*.md` and generates the feed on
  `posts.html` at deploy time. This makes it truly "write in CMS → appears on site," but
  it's a follow-up project that changes how the site builds. I can set this up separately
  when you're ready.

For now, Option 1 works with everything above. When you want the fully automatic pipeline,
that's the next step.

---

## Troubleshooting

- **`/admin` doesn't ask for Microsoft login** → the Access application domain/path is
  wrong, or DNS for the domain isn't proxied through Cloudflare. Check the path is exactly
  `admin`.
- **Microsoft login works but CMS says "auth error"** → the GitHub OAuth callback URL
  (A4) doesn't exactly match `WORKER_URL/callback`, or the Worker secrets (A3) are wrong.
- **"Not authorized" after Microsoft login** → the signed-in account doesn't match your
  Access policy (B3). Add their email or group.
- **Client secret expired (a few months later)** → regenerate in Entra (B1 step 7) and
  update it in Cloudflare (B2). Same for the GitHub secret if you set an expiry.

---

## What to keep safe

- GitHub OAuth **Client Secret**
- Entra **Client Secret** (and its expiry date)
- These live only in Cloudflare (encrypted) and Entra — never commit them to the repo.
