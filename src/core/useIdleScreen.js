import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_IDLE_SECONDS = 30;
const ACTIVITY_EVENTS = [
  "pointermove",
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
  "focusin",
];

function requestedDelay() {
  if (typeof window === "undefined") return DEFAULT_IDLE_SECONDS * 1000;
  const raw = new URLSearchParams(window.location.search).get("idle");
  if (raw === null || raw.trim() === "") return DEFAULT_IDLE_SECONDS * 1000;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds)) return DEFAULT_IDLE_SECONDS * 1000;
  return Math.max(1, Math.min(300, seconds)) * 1000;
}

function isEditing() {
  const active = document.activeElement;
  if (!active) return false;
  return (
    active.matches("input, textarea, select") ||
    active.getAttribute("contenteditable") === "true"
  );
}

export function useIdleScreen(enabled) {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const timerRef = useRef(null);
  const lastScheduleRef = useRef(0);

  const dismiss = useCallback(() => {
    activeRef.current = false;
    setActive(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      window.clearTimeout(timerRef.current);
      dismiss();
      return undefined;
    }

    const schedule = () => {
      window.clearTimeout(timerRef.current);
      if (activeRef.current || document.hidden || isEditing()) return;
      timerRef.current = window.setTimeout(() => {
        if (document.hidden || isEditing()) {
          schedule();
          return;
        }
        activeRef.current = true;
        setActive(true);
      }, requestedDelay());
    };

    const onActivity = (event) => {
      if (activeRef.current) {
        if (
          event.type === "pointerdown" ||
          event.type === "touchstart" ||
          (event.type === "keydown" && ["Enter", "Escape", " "].includes(event.key))
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          dismiss();
          window.requestAnimationFrame(schedule);
        }
        return;
      }
      const now = performance.now();
      if (now - lastScheduleRef.current < 500) return;
      lastScheduleRef.current = now;
      schedule();
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.clearTimeout(timerRef.current);
        dismiss();
      } else {
        schedule();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: false, capture: true }),
    );
    document.addEventListener("visibilitychange", onVisibility);
    schedule();

    return () => {
      window.clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity, true));
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [dismiss, enabled]);

  return { active, dismiss };
}
