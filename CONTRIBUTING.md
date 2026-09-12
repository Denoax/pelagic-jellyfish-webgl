# Contributing to Pelagic

Preserve a named runtime baseline before changing behavior. Publication work and artwork changes belong in separate branches; a newer commit is not automatically visually approved. Do not rewrite historical failed-review reports as successes.

For code changes, run the production build, all tests and both approved parity scripts described in [REPRODUCIBILITY.md](REPRODUCIBILITY.md). Identify pre-existing failures separately. Capture matched views and real motion for visual changes. Record backend, drawing buffer, DPR, scene state and capture timing. Benchmarks must run separately from capture and retain stalls.

For publication changes, edit `paper/manuscript.md` or `paper/supplement-source.md`, not only their generated PDF/Markdown/TeX outputs. Update the source map and claim ledger whenever a technical claim changes. Verify references against primary metadata. Do not invent a DOI, affiliation, release status, physical claim or benchmark result. Build and inspect both PDFs after changes.

Use original or appropriately licensed assets and preserve all third-party notices. State where AI assistance was used. Contributions must be compatible with the [split license policy](LICENSE.md): original code MIT, original publication/media CC BY 4.0, third-party exceptions unchanged.

Keep large videos, raw frame folders and profiling traces out of ordinary Git history. Review the archive allowlist and manifest before sharing. Do not include profiles, tokens, private notes or machine-specific paths. Any push, release, deployment or Pages update requires separate authorization from the project owner.
