import { lazy, Suspense } from "react";
import { IdleScreen } from "./ui/IdleScreen.jsx";
import { useMotionPreference } from "./core/useMotionPreference.js";
import { useIdleScreen } from "./core/useIdleScreen.js";
import { identity } from "./content/site.js";

const HeroScene = lazy(() =>
  import("./scene/HeroScene.jsx").then((module) => ({ default: module.HeroScene })),
);

const chapterIds = ["intro", "work", "services", "about", "contact"];

export function App() {
  const motion = useMotionPreference();
  const idle = useIdleScreen(!motion.reduced);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to the artwork
      </a>

      <Suspense fallback={<div className="ocean-stage ocean-stage--loading" aria-hidden="true" />}>
        <HeroScene reducedMotion={motion.reduced} />
      </Suspense>

      <header className="site-header" aria-label="Artist">
        <div className="header-actions">
          <a className="wordmark" href="#intro" aria-label="Mani Marami Milani, return to surface">
            {identity.name.toUpperCase()}
          </a>
          <a
            className="header-contact"
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Denoax on GitHub"
          >
            GITHUB
          </a>
        </div>
      </header>

      <main id="main-content" aria-label="Pelagic visual journey">
        <h1 className="screen-reader-only">Pelagic liquid clock and living jellyfish artwork</h1>
        {chapterIds.map((id) => (
          <section
            id={id}
            className={`chapter chapter-${id}`}
            aria-label={`${id} scene`}
            key={id}
          />
        ))}
      </main>

      <footer className="site-footer">
        <a href={identity.github} target="_blank" rel="noreferrer">
          @DENOAX · © {new Date().getFullYear()}
        </a>
        <a href="#intro">RETURN TO THE SURFACE ↑</a>
      </footer>

      <IdleScreen active={idle.active} onDismiss={idle.dismiss} />
    </>
  );
}
