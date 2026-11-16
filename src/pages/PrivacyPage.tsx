import Link from "@/components/core/Link";
import { ChevronLeft, ShieldCheck, Database, EyeOff, ExternalLink } from "lucide-react";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import { siteConfig } from "@/config/site";
export default function PrivacyPage() {
    return (<div className="relative isolate min-h-screen min-h-dvh w-full flex flex-col p-4 sm:p-8 md:p-12 pt-[max(1rem,var(--safe-area-top))] pb-[max(1rem,var(--safe-area-bottom))] pl-[max(1rem,var(--safe-area-left))] pr-[max(1rem,var(--safe-area-right))] sm:p-8 md:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      <BackgroundOverlay />

      <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/6 blur-[90px] sm:blur-[140px] pointer-events-none -z-10 animate-breathe"/>

      <header className="w-full max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--divider)] mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 active:scale-90 hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] cursor-pointer shadow-sm" title="Back to Home">
            <ChevronLeft className="w-5 h-5 text-[var(--accent)]"/>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]">Privacy Policy</h1>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              How Atrium Tabs handles your information
            </p>
          </div>
        </div>
        <span className="text-[10px] tracking-[0.2em] font-light text-[var(--foreground)]/40 dark:text-[var(--accent)]/55 uppercase select-none">
          v{siteConfig.version}
        </span>
      </header>

      <main className="animate-fade-in-up w-full max-w-3xl mx-auto flex-1 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-8 relative min-h-[450px] transition-all duration-300">

        <div className="p-4 rounded-xl border border-[var(--glass-border)]/50 bg-[var(--foreground)]/[0.01] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
            <ShieldCheck className="w-5 h-5"/>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[var(--foreground)]/90">No Project Analytics</span>
            <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">
              The application has no project-operated analytics or account backend. Some features send requests to third-party services described below; those providers receive the request data and connection metadata needed to answer them. <span className="text-[var(--foreground)]/40">(Last updated: June 2, 2026)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-sm text-[var(--foreground)]/80 leading-relaxed">

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[var(--accent)]"/> 1. Data Collection
            </h2>
            <p>
              Atrium Tabs does not maintain user accounts, a search-history feature, or an application backend that receives search queries. When you submit a search, the query is sent to the selected search provider. While you type, supported autocomplete providers may receive partial query text. The app keeps a small, temporary in-memory cache of autocomplete results for the current page session; it does not persist a search history. Third-party providers may receive connection metadata and handle requests under their own policies.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent)]"/> 2. Local Storage & Sync
            </h2>
            <p>
              Settings are stored in browser storage (primarily <code>localStorage</code>); uploaded background image data is stored separately in <code>IndexedDB</code>. The app does not upload those image files. In supported extension builds, optional <strong>Settings Sync</strong> (off by default) stores settings marked for sync—including appearance, quicklinks, search engine configuration, and some weather/mail/background preferences—in the browser&apos;s sync storage (Firefox uses Firefox Sync). Mozilla&apos;s or your browser provider&apos;s sync terms apply. Clearing local browser or extension data removes local copies, but enabled sync may restore synced settings when the extension starts; manage or disable sync in the browser as well. Clearing the HTTP cache alone does not erase stored settings.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[var(--accent)]"/> 3. Third-Party Integrations
            </h2>
            <p>
              Features can make requests to external services. Some requests happen automatically when a feature is enabled (for example, weather refresh after location permission has already been granted, displayed favicon images, and quotes when the greeting is enabled); others happen when you type a search, choose a wallpaper, or enter a city. Requests include ordinary network metadata such as your IP address. The service receives the data described here:
            </p>
            <ul className="list-disc pl-5 mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/70">
              <li>
                <strong>Weather and location</strong>: Forecast coordinates are sent to Open-Meteo. When automatic weather is enabled and the browser has granted geolocation access, the app can refresh the forecast without another prompt. Browser permission controls whether coordinates are available. Coordinates are sent to BigDataCloud for reverse geocoding, with Nominatim as a fallback. If you search for a city manually, the typed city name is sent first to Open-Meteo&apos;s geocoding API and may be sent to Nominatim if that lookup fails. The app has no weather account; these providers&apos; handling and retention are governed by their own policies.
              </li>
              <li>
                <strong>Favicon lookups</strong>: Displayed shortcut icons may be fetched from Google&apos;s favicon service. The request includes the shortcut&apos;s domain in its URL; Google also receives ordinary connection metadata.
              </li>
              <li>
                <strong>Quotes</strong>: When the greeting is enabled in a quote-bearing mode, extension builds may request a quote from the ZenQuotes API (<a href="https://zenquotes.io/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">zenquotes.io</a>). Quotes are cached in browser storage for up to two hours. The hosted website uses a bundled curated quote collection.
              </li>
              <li>
                <strong>Backgrounds</strong>: The optional photo gallery requests listings and images from Picsum (picsum.photos); curated photos load from Unsplash&apos;s image CDN (images.unsplash.com). When Bing Daily Wallpaper is selected, metadata is requested from Bing, with bing.biturl.top as a fallback, and the selected image is loaded from its image host. If you provide a remote image URL, your browser requests that URL directly.
              </li>
              <li>
                <strong>Search providers &amp; suggestions</strong>: Submitting a search sends the query to the selected provider. When Google, DuckDuckGo, or Brave Search is active, partial query text may also be sent to that provider&apos;s suggestions API for autocomplete. Each provider&apos;s own privacy terms apply.
              </li>
              <li>
                <strong>Shortcuts and mail links</strong>: Activating a quicklink or mail shortcut navigates your browser to the configured destination. That destination receives the normal navigation request and connection metadata. Custom URLs are chosen by you and may point to services not named in this policy.
              </li>
            </ul>
            <p className="text-xs text-[var(--foreground)]/60 mt-2">
              The app has no project-operated application API for these features. The third-party services above receive requests for relevant enabled or selected features; this can include background refreshes and partial search text. Services may change their handling or retention policies. See the project&apos;s <a href={siteConfig.links.github + "/blob/main/THIRD-PARTY-NOTICES.md"} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Third-Party Notices</a> for the known services, attribution, and license information.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">4. Security</h2>
            <p>
              Because your configuration settings are stored locally on your device, the security of your settings is dependent on the security of your browser and local operating system user profile. We recommend keeping your web browser updated.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">5. Your Rights & Data Controls</h2>
            <p>
              You can manage or clear local browser/extension storage through your browser. The in-app settings export covers settings marked for backup; it does not include uploaded background image data in IndexedDB. If browser sync is enabled, synced settings may be restored until they are also removed from sync storage. The app does not operate an account or application backend that receives these settings, but third-party services and the host of any deployed website may process request data under their own policies. For concerns about an integration, contact the maintainers using the project channels below; do not send sensitive personal information in a public issue or chat.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">6. Changes to This Policy</h2>
            <p>
              We reserve the right to update this privacy policy when needed. Any changes will be updated directly in the open-source repository and reflected in newer app versions.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[var(--divider)] pt-4 mt-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Contact & Support</h2>
            <p>
              For privacy concerns, questions, or auditing our open-source codebase, please visit our{" "}
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5">
                GitHub Repository
              </a>{" "}
              or join the conversation on our{" "}
              <a href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5">
                Discord Server
              </a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="w-full max-w-3xl mx-auto pt-8 pb-4 flex max-sm:flex-col max-sm:items-center max-sm:gap-3 justify-between border-t border-[var(--divider)] mt-8 select-none text-center max-sm:text-center">
        <span className="text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <div className="flex gap-4 text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          <Link href="/tos" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="text-[var(--accent)] font-normal">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/trademarks" className="hover:text-[var(--accent)] transition-colors">Trademarks</Link>
        </div>
      </footer>
    </div>);
}
