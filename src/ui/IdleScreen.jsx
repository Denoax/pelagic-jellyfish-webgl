import { useCallback, useEffect, useState } from "react";
import { IdleGlassScene } from "../scene/IdleGlassScene.jsx";

export function IdleScreen({ enabled, active, onDismiss }) {
  const [prepared, setPrepared] = useState(false);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const markFailure = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  const visible = enabled && active && ready && !failed;
  useEffect(() => {
    if (!enabled) {
      setPrepared(false);
      setReady(false);
      return;
    }
    if (prepared) return;
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setPrepared(true), 2200);
    };
    const events = ["pointermove", "wheel", "scroll", "keydown", "touchstart"];
    events.forEach(event => window.addEventListener(event, schedule, { passive: true }));
    schedule();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, schedule));
    };
  }, [enabled, prepared]);
  useEffect(() => {
    if (active) {
      setLeaving(false);
      return;
    }
    setLeaving(true);
    const timer = setTimeout(() => setLeaving(false), 2600);
    return () => clearTimeout(timer);
  }, [active]);
  useEffect(() => {
    document.documentElement.classList.toggle("idle-active", visible);
    return () => document.documentElement.classList.remove("idle-active");
  }, [visible]);
  return (
    <div
      className={`idle-screen ${visible ? "is-active" : leaving && ready ? "is-leaving" : ""}`}
      aria-hidden="true"
      onClick={onDismiss}
      data-testid="idle-screen"
      data-ready={ready}
    >
      {prepared && !failed && (
        <IdleGlassScene
          running={visible || leaving}
          onReady={markReady}
          onFailure={markFailure}
        />
      )}
    </div>
  );
}
