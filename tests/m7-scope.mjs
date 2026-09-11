// M7 explicitly authorizes idle ownership and compositor integration only.
// Older milestone scope checks still run, with these newly authorized paths.
import {asset2Paths} from './asset2-scope.mjs';
export const m7Paths=['src/App.jsx','src/core/useIdleScreen.js','src/ui/IdleScreen.jsx','src/styles.css','src/scene/HeroScene.jsx','src/scene/glass/LiveOceanLens.js','src/scene/glass/OceanIdleGlass.js','src/scene/glass/IdleDisplacement.js','src/scene/glass/IdleLiquidState.js','src/scene/glass/LiquidChoreography.js',...asset2Paths]; // New seams are independently byte-checked by asset2.test.
