import Link from "@/components/core/Link";
import { ChevronLeft, Scale, ShieldCheck, PenLine } from "lucide-react";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import { siteConfig } from "@/config/site";
export default function TrademarksPage() {
    return (<div className="relative isolate min-h-screen min-h-dvh w-full flex flex-col p-4 sm:p-8 md:p-12 pt-[max(1rem,var(--safe-area-top))] pb-[max(1rem,var(--safe-area-bottom))] pl-[max(1rem,var(--safe-area-left))] pr-[max(1rem,var(--safe-area-right))] sm:p-8 md:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      <BackgroundOverlay />

      <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/6 blur-[90px] sm:blur-[140px] pointer-events-none -z-10 animate-breathe"/>

      <header className="w-full max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--divider)] mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 active:scale-90 hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] cursor-pointer shadow-sm" title="Back to Home">
            <ChevronLeft className="w-5 h-5 text-[var(--accent)]"/>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]">Trademarks &amp; Branding</h1>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              How the Atrium Tabs name and marks may be used
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
            <PenLine className="w-5 h-5"/>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[var(--foreground)]/90">Code is MIT, the brand is not</span>
            <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">
              The MIT license covers the Atrium Tabs codebase. The project&apos;s name, logo, icons, and other brand marks are not licensed under it. This page summarizes the project&apos;s <a href={siteConfig.links.github + "/blob/main/TRADEMARKS.md"} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Trademarks &amp; Branding Policy</a>. <span className="text-[var(--foreground)]/40">(Effective: September 8, 2026)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-sm text-[var(--foreground)]/80 leading-relaxed">

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]"/> 1. What&apos;s Protected
            </h2>
            <p>
              The name &quot;Atrium Tabs&quot;, the &quot;Atrium&quot; name as used for this project, the project logo, icons, and other brand graphics and design marks (the &quot;Marks&quot;) remain the property of the Atrium Tabs Contributors. Nothing in the MIT license grants rights to use the Marks.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">2. Allowed Without Permission</h2>
            <ul className="list-disc pl-5 mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/70">
              <li><strong>Attribution</strong>: truthfully referring to the project by name as the origin of the software (&quot;fork of Atrium Tabs&quot;, &quot;based on Atrium Tabs&quot;).</li>
              <li><strong>Verbatim forks with credit</strong>: redistributing unmodified copies while keeping the original name and branding intact.</li>
              <li><strong>Nominative fair use</strong>: describing or linking to the project in articles, reviews, or comparisons.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--accent)]"/> 3. Requires Written Permission
            </h2>
            <ul className="list-disc pl-5 mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/70">
              <li>Distributing a <strong>modified version</strong> under the &quot;Atrium Tabs&quot; or &quot;Atrium&quot; name, or with the project&apos;s logo or icons, in a way that could confuse users about its origin.</li>
              <li>Using the Marks as part of your own product, domain, store listing, or extension name (e.g. &quot;Atrium Tabs Pro&quot;, &quot;Atrium Launcher&quot;).</li>
              <li>Using the Marks in a way that implies endorsement, sponsorship, or affiliation with the project.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">4. Renaming Your Fork</h2>
            <p>
              If you distribute a modified version, please rebrand it (name, logo, and icons) and remove or replace the project&apos;s Marks. Forks must also respect the reserved font names of the bundled fonts under the SIL Open Font License 1.1 (see the font license files shipped in <code>public/fonts/</code>).
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[var(--divider)] pt-4 mt-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Questions &amp; Permission Requests</h2>
            <p>
              For trademark questions or to request permission, please open a discussion in our{" "}
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5">
                GitHub Repository
              </a>{" "}
              or contact the maintainers on the{" "}
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
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/trademarks" className="text-[var(--accent)] font-normal">Trademarks</Link>
        </div>
      </footer>
    </div>);
}
