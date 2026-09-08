# Third-Party Notices

Atrium Tabs incorporates and relies on the following third-party software,
fonts, and services. This file lists their licenses and required attributions.
All external network requests are made directly from your browser to the
services listed here; no data passes through project-owned servers.

## Bundled Fonts (SIL Open Font License 1.1)

The following fonts are bundled with and redistributed by this project, each
under the SIL Open Font License, Version 1.1. Verbatim license copies are
shipped alongside the font files in `public/fonts/`:

- **Outfit** (`public/fonts/outfit-latin.woff2`, `outfit-latin-ext.woff2`)
  © 2021 The Outfit Project Authors, https://github.com/Outfitio/Outfit-Fonts
  License: `public/fonts/outfit-latin-OFL.txt`
- **Geist Mono** (`public/fonts/geist-mono-latin.woff2`, `geist-mono-latin-ext.woff2`)
  © 2024 The Geist Project Authors, https://github.com/vercel/geist-font
  License: `public/fonts/geist-mono-latin-OFL.txt`

## Libraries (npm, MIT unless noted)

- **React / React DOM** (Meta Platforms, Inc. and contributors, MIT)
- **lucide-react** (Lucide Contributors, ISC)
- **clsx** (Luke Edwards, MIT)
- **tailwind-merge** (Dylann Basham, MIT)
- **Vite** (Evan You and Vite Contributors, MIT)
- **Tailwind CSS v4** (Tailwind Labs, Inc., MIT)
- **TypeScript** (Microsoft Corporation, Apache-2.0)
- **Vitest / @vitest ecosystem tooling** (Vitest contributors, MIT)
- **@vitejs/plugin-react** (Vite contributors, MIT)
- **jsdom, @testing-library/jest-dom** (respective contributors, MIT)

Full license texts for all npm dependencies are available in
`node_modules/<package>/LICENSE` after installation and via
`npm ls --all`.

## External Services (client-side, attribution and data handling)

- **Open-Meteo** (open-meteo.com): weather forecasts, client-side only.
  Available under the Creative Commons Attribution 4.0 International
  (CC BY 4.0) license. https://open-meteo.com/
- **OpenStreetMap Nominatim** (nominatim.openstreetmap.org): city lookups
  and place names for the weather widget. Data © OpenStreetMap contributors,
  ODbL. https://www.openstreetmap.org/copyright
- **ZenQuotes** (zenquotes.io): inspirational quotes (browser extension
  build only). ZenQuotes requests that the API be attributed; attribution:
  quotes provided by https://zenquotes.io/
- **Google Favicon Service** (google.com/s2/favicons): shortcut favicon
  lookups; receives only the shortcut's domain name.
- **Search Suggestions** (suggestqueries.google.com, duckduckgo.com, search.brave.com):
  live search autocomplete when Google, DuckDuckGo, or Brave Search is the active engine.
  Partial query text is sent directly to the respective provider's suggestions API.
- **Picsum** (picsum.photos): sample background photo gallery. Photos are
  sourced by Picsum from Unsplash under the Unsplash License.
- **Unsplash** (images.unsplash.com): curated background photography, used
  under the Unsplash License (https://unsplash.com/license); photographers
  are credited in `src/utils/backgrounds.ts` and via their profile links in
  the app.
- **Bing** (bing.com): Bing Daily Wallpaper metadata and imagery via the
  public HPImageArchive endpoint; imagery remains © Microsoft and the
  respective image owners, displayed for personal, non-commercial use as
  background wallpaper.
- **Search engines** (Google, DuckDuckGo, Brave, Bing, and any custom
  engines): search queries typed into the search bar are submitted
  directly to the chosen engine and are governed by that provider's terms
  and privacy policy.

## Trademarks

All product names, logos, brands, and trademarks referenced above are the
property of their respective owners. Their use by Atrium Tabs is for
identification and interoperability purposes only and does not imply
affiliation with or endorsement by them.
