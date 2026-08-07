# HumanFirewallHQ

A static cybersecurity education and marketing site for real humans.

## Local preview

```bash
python server.py
```

Open <http://127.0.0.1:8080/>. The server intentionally serves only the site's public HTML, CSS, JavaScript, favicon, and image assets. There are no accounts, passwords, cookies, analytics, API routes, or server-side user records.

Checklist progress is an optional browser-local convenience stored in `localStorage`; it is not an account or a security boundary.

The homepage reads `social-feed.json` for the three latest public X posts. `tools/update_social_feed.py` is a best-effort, dependency-free updater intended for a six-hour scheduler such as GitHub Actions; if X blocks the public profile page, it fails without overwriting the last known feed.
