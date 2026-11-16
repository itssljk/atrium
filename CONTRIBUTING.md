# Contributing to Atrium Tabs

Thank you for considering a contribution! Atrium Tabs is a browser start page
that stores settings in the browser and makes direct requests to third-party
services for some optional features. We welcome bug reports, features,
documentation, and design improvements.

## Getting Started

```bash
git clone https://github.com/itssljk/atrium.git
cd atrium
npm install
npm run dev      # local dev server at http://localhost:5173
```

Before opening a PR, make sure all of these pass:

```bash
npm test          # Vitest unit tests
npm run typecheck # TypeScript typecheck
npm run build     # Production build
```

## How to Contribute

1. **Open an issue first** for anything non-trivial (new features, behavior
   changes) so we can align on the approach before you write code.
2. **Fork and branch.** Work on a descriptive branch like
   `feat/weather-widget-hours` or `fix/accent-boot-flash`.
3. **Keep PRs focused.** One feature or fix per PR, with a clear description
   of the problem and the change.
4. **Match existing conventions.** Follow the patterns in nearby code and the
   code guidelines below.

## Code Guidelines

- No project-owned application API, user accounts, or analytics are part of this app; optional features may contact third-party services directly from the browser.
- Follow [`DESIGN.md`](./DESIGN.md) as the intended visual direction. It is a forward-looking guide; update it when design decisions or shipped behavior change.
- Document new external requests and the data they receive in `THIRD-PARTY-NOTICES.md` and the Privacy Policy (`src/pages/PrivacyPage.tsx`); update extension host permissions when needed.
- No new runtime dependencies without discussion; keep the bundle lean.
- Accessibility matters: keyboard navigation, focus states, and readable contrast are requirements, not nice-to-haves. Do not describe contrast as APCA-verified unless it has been measured.

## Licensing of Contributions

By contributing code, documentation, or other material to this repository, you
agree that your contributions are licensed under the project's [MIT License](./LICENSE).
The MIT License applies to the contributed material as specified in that license;
it does not grant rights to project trademarks. You confirm you have the right
to submit your contributions under those terms.

## Reporting Bugs & Security Issues

- Bugs and feature requests: [GitHub Issues](https://github.com/itssljk/atrium/issues)
- **Security vulnerabilities: do NOT open a public issue.** See [SECURITY.md](./SECURITY.md)
- Community questions: the [Atrium Tabs Discord](https://discord.gg/Kfn4V2nF3N)

Please be kind and constructive in all interactions. Everyone is expected to
follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
