# Pages publication follow-up — 2026-09-07

Mani explicitly clarified that finished work should update the GitHub Pages website as well as the appropriate GitHub branch. **Publication is not visual approval. Milestone 2 remains ready for review.**

Pages permits deployment from `main` only. Keep that existing restriction: push the dedicated feature branch, then fast-forward the tested release to `main` without rewriting history. The existing Pages workflow performs the deployment. No new hosting service, environment-policy weakening or later milestone is involved.

The Pages build now sets `VITE_OCEAN_RELEASE=milestone-2` alongside the existing project base path. That selects the approved M1 foreground animal and the M2 connected ocean without requiring URL switches. Normal local development comparisons remain available. The old review report's DEV-only/default-unchanged statements describe its original capture conditions, before this publication authorization.

Production does not instantiate `SpecimenPreview` or expose its keyboard/camera controls. The connected production clock uses the same bounded elapsed-time progression as the reviewed fixture; it does not catch up background-tab wall time. Existing adaptive quality remains available for visitors. The release uses the validated WebGL2 backend of the unchanged Three.js 0.175.0 renderer; the pre-existing full-ocean WebGPU issue is not silently shipped as the default or claimed fixed.

Validation: all 28 tests and the production Pages-profile build pass. CI now fetches baseline history required by the existing exact-parity tests and runs the full test set. Browser evidence for the actual production build is in `evidence/production-release/`; release metadata confirms `milestone-2` and absent specimen controls. The first local preview attempt had an incorrect server base path and was corrected before validation/publication.

Reproduce the shipping build locally:

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 127.0.0.1 --port 5181 --strictPort
```

Live deployment status is authoritative in the repository's **Deploy Pelagic to GitHub Pages** workflow. Keep the dedicated review branch and its before/after evidence; do not treat the live update as permission to begin Milestone 3.
