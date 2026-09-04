import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { chapters } from "../content/site.js";

export function Header({ activeId }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    return () => document.body.classList.remove("menu-is-open");
  }, [menuOpen]);

  return (
    <header className="site-header">
      <a className="wordmark" href="#intro" aria-label="Mani Marami Milani, return to top">
        MANI MARAMI MILANI
      </a>

      <div className="header-actions">
        <a className="header-contact" href="#contact">
          MAKE CONTACT
        </a>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="site-index"
        >
          {menuOpen ? <X aria-hidden="true" /> : null}
          {menuOpen ? "CLOSE" : "INDEX"}
        </button>
      </div>

      <nav
        id="site-index"
        className={`site-index ${menuOpen ? "is-open" : ""}`}
        aria-label="Site index"
        aria-hidden={!menuOpen}
      >
        <p>DESCENT INDEX</p>
        <div>
          {chapters.map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              onClick={() => setMenuOpen(false)}
              className={activeId === chapter.id ? "is-active" : ""}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>{chapter.number}</span>
              {chapter.label}
              <small>{String(chapter.depth).padStart(3, "0")} M</small>
            </a>
          ))}
        </div>
        <a
          className="index-contact"
          href="#contact"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        >
          START A PROJECT <ArrowUpRight aria-hidden="true" weight="bold" />
        </a>
      </nav>
    </header>
  );
}
