// Linear pre-ACES radiance; distances are ocean units unless marked /R.
// No exposure, camera, animal or M7 settings live here.
export const ASSET2=Object.freeze({
 abyss:{base:[.002,.004,.009],void:[.0003,.0005,.001],opening:[.018,.043,.079]},
 spires:{clusters:6,perCluster:5,archetypes:4,contrast:.16,extinction:[17,80]},
 fog:{base:.022,nearFloor:.012,far:.030,farRange:[24,65],floorY:[-17,-9],ambient:[.57,.64,.70],footprint:[65,91]},
 haze:{distance:35,right:-5,up:5,width:.52,height:.50,falloff:1.8,coarseScale:[.23,.12,.23],coarseGain:1.2,fineScale:.61,fineGain:.27,base:.72},
 fade:{coreR:.85,geometryR:[1,1.65],cameraR:[1,2.1],belowFloor:[-23,-14]},
 light:{max:1,reuses:'M6 AnimalLight; no new selection or lights',radiusR:.12,gain:3,surfaceGain:1.9},
 particles:{simulation:'approved M2 unchanged',layerBase:[.65,.4,.35],corridorGain:[.25,1.35,.65],corridorRadius:3.5},
 ao:{material:0,gtao:false},shafts:{count:0},
 guide:{retained:false,testedWeight:.12,reason:'no material gain; slightly worse MAE'},
});
export function smoothRange(x,a,b){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
export function outerVisibility(radiusR){return (1-smoothRange(radiusR,...ASSET2.fade.geometryR))**2;}
