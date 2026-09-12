// M7 explicitly authorizes idle ownership and compositor integration only.
import {releasePaths} from './release-scope.mjs';
// Older milestone scope checks still run, with these newly authorized paths.
export const m7Paths=['src/App.jsx','src/core/useIdleScreen.js','src/ui/IdleScreen.jsx','src/styles.css','src/scene/HeroScene.jsx','src/scene/glass/LiveOceanLens.js','src/scene/glass/OceanIdleGlass.js','src/scene/glass/IdleDisplacement.js','src/scene/glass/IdleLiquidState.js','src/scene/glass/LiquidChoreography.js']; // M7.1: one authorized topology director
m7Paths.push(...releasePaths); // Each release-only file is exact-delta checked on import.
