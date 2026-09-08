# Security Policy

## Supported Versions

Security fixes are applied to the latest released version on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions, or Discord.**

Instead, report them privately via
[GitHub Security Advisories](https://github.com/itssljk/atrium-tabs/security/advisories/new)
on this repository. If you cannot use GitHub Security Advisories, contact the
maintainer directly through the
[Atrium Tabs Discord](https://discord.gg/Kfn4V2nF3N) and ask for a private
channel to discuss the finding.

Please include as much of the following as you can:

- A description of the vulnerability and its impact
- Step-by-step reproduction instructions or a proof of concept
- The version/commit you tested against
- Any relevant logs or screenshots

## What to Expect

- We will acknowledge your report within **7 days**.
- We will investigate and keep you updated on our assessment and fix timeline.
- Once a fix is released, we will credit you in the release notes if you wish.

## Scope

Atrium Tabs is a fully client-side application. Of particular interest:

- Content Security Policy bypasses or injection via user-supplied settings
  (custom backgrounds, quicklink URLs, custom search engines, `!bangs`)
- Anything that would exfiltrate user data (settings, searches, location) to
  parties other than those documented in `THIRD-PARTY-NOTICES.md` and the
  Privacy Policy
- Manifest V3 permission misuse or privilege escalation in the extension build

## Non-Scope

- Vulnerabilities in the third-party services themselves (Open-Meteo, ZenQuotes,
  Picsum, Unsplash, Bing, Google, DuckDuckGo, Brave): please report those to
  the respective providers.
- Theoretical issues with no plausible exploit path in the shipping build.
