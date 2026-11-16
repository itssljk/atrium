# Atrium Tabs

A minimalist, dark-themed start page and new tab replacement for your browser, with ambient lighting, customizable accents, and optional settings sync in supported extension builds.

## Features

- **Obsidian canvas & customizable accents** with 5 curated presets, auto-accent extraction from wallpapers, and full custom color control.
- **Ambient glow** toggle for a subtle background light effect.
- **Dynamic greetings** that change based on the time of day, with inspirational quotes.
- **Quick search** with support for multiple search engines (Google, DuckDuckGo, Brave, Ecosia, Startpage, and custom engines).
- **Preferences drawer** for accent colors, ambient glow, performance mode, layout geometry, and quick settings search.
- **Optional settings sync** across devices for selected preferences via browser sync storage (Firefox Sync in Firefox extension builds).
- **Quick-action mail button** with one-click access to Gmail, Outlook, ProtonMail, iCloud, Yahoo, or custom webmail in multiple styles (pill, icon, or glass).
- **Pre-rendered startup skeleton** to show the page structure before the app finishes loading.
- **Locally stored settings and self-hosted fonts** (`Outfit` and `Geist Mono`); no project analytics or tracking code. Optional features make requests to third-party services—see the [Privacy Policy source](./src/pages/PrivacyPage.tsx) and [Third-Party Notices](./THIRD-PARTY-NOTICES.md).
- **Optimized custom backgrounds** with automatic client-side downscaling and WebP compression for instantaneous loading, plus Bing Daily Wallpaper, curated photography, uploads, pasted URLs, or web gallery. Includes opacity, blur, and dimming controls.
- **Search autofocus & bangs** for instant typing on new tabs (`Ctrl+T`), search engine switching, and custom `!bangs`.

Atrium starts with a dark browser tint. With Smart Readability on, it reuses the wallpaper analysis to approximate the photo’s top color without requesting another image. The tint stays dark for the built-in gradient, when Smart Readability is off, or when an image can’t be sampled. Safari controls the final tint and may vary it by tab layout and browser settings.

## Tech Stack

- **Bundler & Dev Server**: Vite
- **UI & Logic**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20.11+

### Running Locally

1. Clone the repository and navigate into it:
   ```bash
   git clone https://github.com/itssljk/atrium.git
   cd atrium
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Installing as a Browser Extension

1. Build the extension-ready static bundle.

   ```bash
   npm run build
   ```

2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and select `dist/manifest.json` (or any file inside `dist/`).

To create a versioned ZIP for distribution (including the project license and attribution documents), run:

```bash
npm run build:extension
```

The build produces static files with no inline scripts and Manifest V3 assets for Firefox. Some optional features require network access to services listed in the in-app Privacy Policy and [Third-Party Notices](./THIRD-PARTY-NOTICES.md).

### Development

```bash
npm test          # Vitest unit tests
npm run typecheck # TypeScript typecheck
npm run build     # Production build
```

## Community Standards

- **Contributing**: Bug reports, feature ideas, and PRs are all welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow and code guidelines.
- **Code of Conduct**: Be kind and constructive. Everyone participating in this project (issues, PRs, Discord) agrees to our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
- **Security**: Found a vulnerability? Please don't open a public issue — report it privately via [SECURITY.md](./SECURITY.md).

## License & Trademarks

The app code is licensed under the [MIT License](./LICENSE). Bundled fonts and third-party components have separate license terms; see [Third-Party Notices](./THIRD-PARTY-NOTICES.md).

> [!IMPORTANT]
> **Trademarks**: The MIT license covers the code. The project's name
> ("Atrium Tabs", "Atrium"), logo, and other brand marks are **not** licensed
> under MIT. See [TRADEMARKS.md](./TRADEMARKS.md) for what you may and may
> not do with the branding.
