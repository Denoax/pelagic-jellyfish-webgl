import { useEffect, useState } from "react";
import { IdleGlassScene } from "../scene/IdleGlassScene.jsx";

export function IdleScreen({ active, onDismiss }) {
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      return undefined;
    }
    const unmountTimer = window.setTimeout(() => setMounted(false), 2600);
    return () => window.clearTimeout(unmountTimer);
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    document.documentElement.classList.toggle("idle-active", active);
    return () => document.documentElement.classList.remove("idle-active");
  }, [active]);

  return (
    <div
      className={`idle-screen ${active ? "is-active" : mounted ? "is-leaving" : ""}`}
      aria-hidden={!active}
      aria-label="Dismiss the liquid clock"
      onClick={onDismiss}
      data-testid="idle-screen"
    >
      {mounted ? <IdleGlassScene now={now} /> : null}
    </div>
  );
}
