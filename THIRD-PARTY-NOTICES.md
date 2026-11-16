# Third-Party Notices

Atrium Tabs incorporates and relies on third-party software, fonts, and
services. This file lists known third-party software, services, and attributions
used by the app. The services below are not an exhaustive list of every possible
request: user-configured search engines, shortcuts, and image URLs may contact
hosts chosen by the user. Mail-provider pages open only when the shortcut is
activated. Requests are made by the browser; the
project does not operate an application API for these features.

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

Dependency names and versions can be inspected with `npm ls --all` after
installation. That command does not include license texts; consult each
package's license and include required notices when redistributing.

## External Services (client-side, attribution and data handling)

- **Open-Meteo** (`api.open-meteo.com`, `geocoding-api.open-meteo.com`):
  weather forecasts and manual city search. Forecast coordinates or the typed
  city query are sent as needed. The service data is available under CC BY 4.0:
  https://open-meteo.com/
- **BigDataCloud** (`api.bigdatacloud.net`): reverse-geocoding coordinates
  and requested language to a place name.
- **OpenStreetMap Nominatim** (`nominatim.openstreetmap.org`): fallback city
  search and reverse geocoding; may receive the typed city query or coordinates
  and browser language. Data © OpenStreetMap contributors, ODbL:
  https://www.openstreetmap.org/copyright
- **ZenQuotes** (zenquotes.io): inspirational quotes (browser extension
  build only). ZenQuotes requests that the API be attributed; attribution:
  quotes provided by https://zenquotes.io/
- **Mail providers** (Gmail, Outlook, Yahoo, Proton Mail, iCloud, Fastmail, or a
  custom provider): the app opens the selected provider when you activate the
  mail shortcut; the provider receives the normal navigation request.
- **Google Favicon Service** (`www.google.com/s2/favicons`): receives the
  shortcut domain requested for a displayed icon.
- **Search Suggestions** (`suggestqueries.google.com`, `duckduckgo.com`,
  `search.brave.com`): live autocomplete when supported; partial query text is
  sent to the selected provider's suggestion endpoint.
- **Picsum** (picsum.photos): sample background photo gallery. Photos are
  sourced by Picsum from Unsplash under the Unsplash License.
- **Unsplash** (images.unsplash.com): curated background photography, used
  under the Unsplash License (https://unsplash.com/license); photographers
  are credited in `src/utils/backgrounds.ts` and via their profile links in
  the app.
- **Bing** (`www.bing.com`) and **Bing Biturl** (`bing.biturl.top`): Bing
  Daily Wallpaper metadata; the app may use Bing Biturl as a fallback. The
  selected image is loaded from the URL returned by the metadata service.
  Imagery remains © Microsoft and the respective image owners; see the source
  service's terms for permitted use.
- **Search engines and user-provided URLs**: search queries are submitted to
  the selected provider (including any custom engine). User-configured shortcut
  and background-image URLs also cause requests to their configured hosts.
  Mail-provider pages are opened only when the mail shortcut is activated.
  Providers receive requests directly from the browser and apply their own
  terms and privacy policies.

## Trademarks

All product names, logos, brands, and trademarks referenced above are the
property of their respective owners. Their use by Atrium Tabs is for
identification and interoperability purposes only and does not imply
affiliation with or endorsement by them.
