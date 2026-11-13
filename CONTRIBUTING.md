# Contributing to Atrium Tabs

Thank you for considering a contribution! Atrium Tabs is a fully client-side,
privacy-first browser start page, and we welcome bug reports, features,
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

- Fully client-side: no servers, no accounts, no telemetry, ever.
- No new external requests without updating `THIRD-PARTY-NOTICES.md` and the
  Privacy Policy (`src/pages/PrivacyPage.tsx`).
- No new runtime dependencies without discussion; keep the bundle lean.
- Accessibility matters: keyboard navigation, focus states, and contrast
  (APCA-checked) are requirements, not nice-to-haves.

## Licensing of Contributions

By contributing code, documentation, or other material to this repository, you
agree that your contributions are licensed under the project's [MIT License](./LICENSE)
(including its branding & trademark exception), and you confirm you have the
right to submit them under those terms.

## Reporting Bugs & Security Issues

- Bugs and feature requests: [GitHub Issues](https://github.com/itssljk/atrium/issues)
- **Security vulnerabilities: do NOT open a public issue.** See [SECURITY.md](./SECURITY.md)
- Community questions: the [Atrium Tabs Discord](https://discord.gg/Kfn4V2nF3N)

Please be kind and constructive in all interactions. Everyone is expected to
follow our [Code of Conduct](./CODE_OF_CONDUCT.md).
