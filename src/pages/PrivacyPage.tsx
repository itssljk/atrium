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
            <span className="text-sm font-semibold text-[var(--foreground)]/90">Zero Tracking Policy</span>
            <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">
              Atrium Tabs is built with privacy as our core tenet. We do not run background trackers, we do not run analytical software, and we do not collect, monetize, or share your personal data. <span className="text-[var(--foreground)]/40">(Last updated: September 8, 2026)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-sm text-[var(--foreground)]/80 leading-relaxed">

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[var(--accent)]"/> 1. Data Collection
            </h2>
            <p>
              We do not collect any personal information, location tracking, or browsing history. Any queries entered into the Search Bar are passed directly to the search provider of your choice (e.g. Google, DuckDuckGo, Brave) and are not logged or stored by Atrium Tabs.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent)]"/> 2. Local Storage & Sync
            </h2>
            <p>
              All configurations, customization settings, and shortcuts are stored inside your browser&apos;s local memory via <code>localStorage</code> and <code>IndexedDB</code>, and we have no access to them. When installed as a Firefox extension, the optional <strong>Settings Sync</strong> feature (disabled by default in Settings) mirrors your preferences through your Firefox account via Firefox Sync so your setup follows you across your devices. That synced data is handled under Mozilla&apos;s Firefox Sync privacy terms. Clearing your browser&apos;s site data or cache will restore Atrium Tabs to its default state.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[var(--accent)]"/> 3. Third-Party Integrations
            </h2>
            <p>
              Atrium Tabs connects to external services to provide convenient features:
            </p>
            <ul className="list-disc pl-5 mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/70">
              <li>
                <strong>Weather Forecasts</strong>: Forecasts are fetched client-side from the Open-Meteo API (open-meteo.com), and city lookups and place names use OpenStreetMap&apos;s Nominatim service. In automatic mode, Atrium Tabs asks your browser for your approximate location (GPS) through the browser&apos;s own permission prompt; only your coordinates are sent to those services to compute and label the forecast, and weather data is never tied to a user account.
              </li>
              <li>
                <strong>Favicon Lookups</strong>: Shortcut icons are fetched from Google&apos;s favicon service (google.com/s2/favicons), which receives only the shortcut&apos;s domain name.
              </li>
              <li>
                <strong>Daily Quotes</strong>: The greeting line shows an inspirational quote cached locally for two hours: in the browser extension fetched from the ZenQuotes API (<a href="https://zenquotes.io/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">zenquotes.io</a>), and on the hosted website served offline from a vetted, curated collection of uplifting quotes.
              </li>
              <li>
                <strong>Background Gallery &amp; Wallpapers</strong>: The Picsum gallery (picsum.photos) is used to browse sample photos, and curated background photos are served from Unsplash&apos;s image CDN. When Bing Daily Wallpaper is enabled, daily image metadata and wallpapers are fetched client-side from Microsoft Bing (bing.com).
              </li>
              <li>
                <strong>Search Providers &amp; Suggestions</strong>: When using the search bar, your query is sent to your selected provider, governed by their respective privacy terms. When Google, DuckDuckGo, or Brave Search is your active engine, partial query text is also sent to that provider&apos;s suggestions API to display live autocomplete results.
              </li>
            </ul>
            <p className="text-xs text-[var(--foreground)]/60 mt-2">
              These integrations power features you explicitly use; Atrium Tabs makes no other requests on your behalf. Weather data is provided by Open-Meteo (licensed CC BY 4.0), place names by OpenStreetMap contributors (ODbL), background photos by Picsum/Unsplash contributors (Unsplash License) and Bing/Microsoft, and quotes by ZenQuotes. Full attribution and license details are maintained in the project&apos;s <a href="https://github.com/itssljk/atrium-tabs/blob/main/THIRD-PARTY-NOTICES.md" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Third-Party Notices</a>.
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
              Because Atrium Tabs stores everything locally and holds no accounts or records about you, you retain full control at all times: you can view, export, or delete all of your settings through your browser, and clearing site data erases everything instantly. We are not a data controller or processor for any personal data under GDPR, CCPA, or similar regulations, as no personal data ever reaches us. If you believe a third-party integration mishandles your data, please reach out via the channels below and we will investigate or remove the integration.
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
