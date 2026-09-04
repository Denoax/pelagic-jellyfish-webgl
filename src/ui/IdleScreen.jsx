import { useEffect, useState } from "react";
import { IdleGlassScene } from "../scene/IdleGlassScene.jsx";

export function IdleScreen({ active, onDismiss }) {
  const [now, setNow] = useState(() => new Date());

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
      className={`idle-screen ${active ? "is-active" : ""}`}
      aria-hidden={!active}
      aria-label="Dismiss the liquid clock"
      onClick={onDismiss}
      data-testid="idle-screen"
    >
      {active ? <IdleGlassScene now={now} /> : null}
    </div>
  );
}
