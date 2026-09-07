# Fresh live audit — working observations, September 7

This instruction explicitly prohibits pushing, merging, deploying or triggering
Pages. It overrides the older publication preference. All work is local on
`milestone-2-live-visual-refinement`; the existing review branch is preserved.

Live/review baseline: `a0501c21f8c782887bf6a5e1257e955ada41b678`.
Approved animal: `515fa71d90f423ac97747cb7a60d1d84d446d13b`.
GitHub main and successful Pages run 34133364127 identify the same live SHA.
Live HTML loads `index-Bt9kzCir.js`; a fresh shipping-profile build reproduces
that entry and `HeroScene-Qtsnr9MU.js` / `ConnectedOcean-Bb6fDGEh.js`.
Shipping environment: VITE_BASE_PATH=/pelagic-jellyfish-webgl/,
VITE_OCEAN_RELEASE=milestone-2. Actual live capture: WebGL 2, release milestone-2,
no specimen controls, no browser errors. Installed Three.js is 0.175.0.

All requested September 7 research and M1/M2 implementation documents were
read before runtime edits. The research's 1b5b83e live source and earlier
DEV-only claims are historical, superseded by a0501c2 and PUBLISHING.md.
Pre-existing dirty root AGENTS.md and untracked research are left untouched.
Baseline full suite 28/28 and shipping build pass (existing large-chunk warning).

## Capture-first observations

1. **Opening / ordinary swimming: animal healthy; wake weak.** Fresh default
   live URL first, 1280×900. The approved blue/pink anatomy is intact. Large
   soft foreground discs create parallax; faint local blue flecks no longer
   overwhelm the animal. In the ordinary pulse sequence, however, the local
   wake is hard to distinguish from the standing fleck population. Numerical
   wake records exist, but that is not proof of a legible propulsion consequence.
2. **Click / recovery: healthy at desktop scale.** Actual raycast clicks in
   live-interaction succeed 5/5. Tissue responds first; a patch of blue
   particulate becomes visible nearby, then subsides. No hard sphere or
   full-screen flash in these frames. Four repeats settle to zero activation
   records/pending echoes. Do not enlarge the event or change its propagation.
3. **Narrow journey: mixed.** 900×900, 20 seconds of calm before interaction,
   spaced and fading-overlap clicks, native-scroll sampling through the endpoint.
   Calm is preserved, but ordinary wake remains low-contrast. Late close framing
   exposes existing older-animal appendages crossing the screen and weak
   composition; camera/population/seabed changes are out of scope.
4. **Portrait: interaction visible, framing limited.** 390×844 emulation on the
   desktop GPU. The selected animal approaches the right edge and part of the
   responding water leaves the frame. No UI collision; distant caps and thin
   strands remain unlike the M1 animal. Do not stage a new portrait camera here.

## Narrow refinement hypothesis

Increase *contrast of existing ordinary wake versus ordinary flecks*, not
general particle count, radius, global exposure, or animal emission. Reduce
the persistent local fleck pedestal slightly; make the same localized wake
envelope more legible in its existing snow/fleck consumers. Use maximum rather
than additive wake/click visibility so overlap cannot raise peak response.
Keep birth positions, actual flow, pulse timing, propagation, decay, camera,
approved animal, and renderer unchanged. Accept only after matched motion.

## Evidence limits

Browser recordings are actual CDP timestamped footage. Motion self-review uses
saved full-size frames and temporally sampled sequences; this environment has
no in-app video playback tool. Narrow/mobile are viewport emulation, not phones.
Captures can add frame cost; all performance runs are separate. Browser tool
`sourceRevision` records the local checkout, not proof of a remote deployment;
the Pages run and reproduced content hashes establish the live identity above.
