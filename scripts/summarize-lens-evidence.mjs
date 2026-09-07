import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
const root = resolve(process.argv[2] || "/tmp/pelagic-m3-evidence");
const statistics = (a) => {
  if (!a?.length) return null;
  const s = [...a].sort((a, b) => a - b);
  return {
    n: s.length,
    median: s[Math.floor(s.length * 0.5)],
    p95: s[Math.floor(s.length * 0.95)],
    maximum: s.at(-1),
    over50: s.filter((v) => v > 50).length,
  };
};
const performance = [];
for (const label of [
  "perf-baseline-a",
  "perf-candidate-a",
  "perf-baseline-b",
  "perf-candidate-b",
  "perf-locked-baseline",
  "perf-locked-candidate",
]) {
  const path = `${root}/${label}/performance.json`;
  if (!existsSync(path)) continue;
  const data = JSON.parse(readFileSync(path));
  const cost = JSON.parse(readFileSync(`${root}/${label}/lens-cost.json`));
  performance.push({
    label,
    info: data.info,
    after: data.after,
    completion: statistics(data.auditRender?.intervals),
    method: data.auditRender?.method,
    raf: statistics(data.intervals),
    lensCpu: statistics(cost.cpu),
    lens: cost.state,
    errors: data.errors,
  });
}
const pixels = [];
for (const label of ["review-desktop", "review-narrow", "review-portrait"]) {
  const decode = (name) =>
    spawnSync(
      "/usr/bin/ffmpeg",
      [
        "-v",
        "error",
        "-i",
        `${root}/${label}/${name}.png`,
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-",
      ],
      { maxBuffer: 12e6 },
    ).stdout;
  if (!existsSync(`${root}/${label}/matched-no-lens.png`)) continue;
  const a = decode("matched-no-lens");
  for (const name of [
    "matched-direct-repeat",
    "matched-passthrough",
    "matched-lens",
  ]) {
    const b = decode(name);
    if (a.length !== b.length) throw Error("Mismatched dimensions");
    let changed = 0,
      maximum = 0,
      sum = 0,
      over3 = 0;
    for (let i = 0; i < a.length; i++) {
      const d = Math.abs(a[i] - b[i]);
      if (d) changed++;
      if (d > 3) over3++;
      maximum = Math.max(maximum, d);
      sum += d;
    }
    pixels.push({
      label,
      comparison: name,
      channels: a.length,
      changed,
      maximum,
      mean: sum / a.length,
      over3,
    });
  }
}
const decodeDesktop = (path) =>
  spawnSync(
    "/usr/bin/ffmpeg",
    ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 12e6 },
  ).stdout;
const approved = decodeDesktop(`${root}/approved-matched/matched-no-lens.png`);
const direct = decodeDesktop(`${root}/review-desktop/matched-no-lens.png`);
const lens = decodeDesktop(`${root}/review-desktop/matched-lens.png`);
if (
  approved.length !== 1280 * 900 * 3 ||
  direct.length !== approved.length ||
  lens.length !== approved.length
) {
  throw Error("Missing full-size matched desktop evidence");
}
let oceanParityChanged = 0,
  oceanParityMax = 0,
  outsideLensChanged = 0;
for (let y = 0; y < 900; y++)
  for (let x = 0; x < 1280; x++)
    for (let c = 0; c < 3; c++) {
      const i = (y * 1280 + x) * 3 + c;
      // Exclude existing DOM header/footer glyph rasterization, not ocean pixels.
      if (y >= 100 && y < 820) {
        const d = Math.abs(approved[i] - direct[i]);
        oceanParityChanged += Number(d > 0);
        oceanParityMax = Math.max(oceanParityMax, d);
      }
      if (x < 450 || x > 1000 || y < 140 || y > 770) {
        outsideLensChanged += Number(direct[i] !== lens[i]);
      }
    }
const parity = {
  oceanBand: [0, 100, 1280, 820],
  oceanParityChanged,
  oceanParityMax,
  conservativeLensBounds: [450, 140, 1000, 770],
  outsideLensChanged,
};
const locked = performance.filter((p) => p.label.startsWith("perf-locked"));
if (
  locked.length === 2 &&
  JSON.stringify(locked[0].info.controlledState) !==
    JSON.stringify(locked[1].info.controlledState)
) {
  throw Error("Exact-state benchmark states differ");
}
writeFileSync(
  `${root}/summary.json`,
  JSON.stringify({ performance, pixels, parity }, null, 2),
);
console.log(
  JSON.stringify(
    {
      performance: performance.map(({ label, completion, lensCpu }) => ({
        label,
        completion: completion ? { ...completion, intervals: undefined } : null,
        lensCpu,
      })),
      pixels,
      parity,
    },
    null,
    2,
  ),
);
