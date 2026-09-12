# Milestone 4 Pages publication

Mani explicitly requested updating the GitHub Pages site after the local M4
review handoff. This authorizes publication, not visual approval or Milestone 5.
Earlier no-push/default-unchanged statements in the review report describe that
earlier handoff, before this new authorization.

- Review baseline: `ece7cc0f26acbd95b8386a02c3e84f2b5efc4f47`.
- Release branch: `release/milestone-4-pages`.
- Runtime promotion: `2df2d45ec54c2a9499e2364be32627c4e54826ce`.
- Previous public/main: `a0501c21f8c782887bf6a5e1257e955ada41b678`.
- Pages workflow now selects `VITE_OCEAN_RELEASE=milestone-4` with the existing
  `/pelagic-jellyfish-webgl/` base path.

The build activates the same M4 population, refined M2 connected ocean and M3
bubble passage without query switches. It does not change their geometry,
materials, currents, optical equations, camera, seabed or idle design. The
existing production adaptive-quality policy remains enabled, and production
continues to use the validated NVIDIA-compatible WebGL2 renderer path rather
than silently enabling the known legacy full-ocean WebGPU issue.

Specimen fixtures, M4 inspection globals and M3 replay controls remain private.
Production ignores specimen/bubble-review query switches; the B-key review tour
is not installed. Ordinary click activation and native scrolling remain live.

Validation: 56 tests, both existing parity scripts and the Pages-profile build
pass. Actual Brave/NVIDIA WebGL2 production smoke test shows the new animal and
bubble modules loaded, release `milestone-4`, no specimen/population/lens/bubble
review globals, one successful real raycast activation, no B-key auto-scroll,
four native journey positions, and zero browser errors. Initial local capture
found the previous preview process had stopped; it was restarted before the
successful test. This was not a successful capture or a public-site outage.

Local evidence: `/home/mani/dev/jellyfish-studio/m4-publish-evidence/`.
The release entry is `index-Du7wn8Xk.js`; scene is `HeroScene-DhjTHiof.js`.
Workflow completion and a fresh public browser capture verify publication
after promotion. Do not infer deployment success from a local build alone.

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-4 npm run build
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 127.0.0.1 --port 5181 --strictPort
```

Publish the review/release branches, then fast-forward `main` through the
existing Pages workflow. No force push or environment-policy change. A rollback
can restore the previous release profile in a new commit; do not rewrite main.
Unrelated user AGENTS/research edits are deliberately excluded.
