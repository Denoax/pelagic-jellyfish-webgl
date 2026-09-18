// Current explicit authorization, independent of all historic milestone scopes.
export const asset2Paths=['src/scene/HeroScene.jsx','src/scene/PelagicEnvironment.js',
 'src/scene/environment/Asset2Environment.js','src/scene/environment/asset2Layout.js','src/scene/environment/asset2Config.js'];
export function withoutAsset2Seams(source){
 return source.split('\n').filter(line=>!line.includes('backgroundPresentation')&&!line.includes('import { Asset2Environment }')).join('\n');
}
