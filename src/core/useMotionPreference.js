import { useEffect, useState } from "react";

function getInitialPreference() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionPreference() {
  const [systemReduced, setSystemReduced] = useState(getInitialPreference);
  const [manualReduced, setManualReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const reduced = systemReduced || manualReduced;

  return {
    reduced,
    canEnable: !systemReduced,
    toggle: () => {
      if (!systemReduced) setManualReduced((value) => !value);
    },
  };
}
