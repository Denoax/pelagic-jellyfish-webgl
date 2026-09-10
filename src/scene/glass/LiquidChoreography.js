import {ease,clamp01} from './IdleLiquidState.js';

// Two real stroke anchors per glyph. Input is only our own tiny CPU clock mask,
// never scene color/readback. Recomputed on text/layout change, not per frame.
export function strokeAnchors(pixels,w,h,portrait,boxes){
 const result=[];
 for(let g=0;g<4;g++){
  const box=boxes?.[g];
  const cx=box?(box.left+box.right)/2:portrait?(g%2?.66:.34):[.255,.405,.597,.75][g];
  const cy=box?box.cy:portrait?(g<2?.32:.695):.49;
  for(let k=0;k<2;k++){
   const tx=cx+(k?.013:-.013),ty=cy+(k?1:-1)*(portrait?.08:.115);
   let best=Infinity,point=[cx,ty];
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=(x+.5)/w,v=(y+.5)/h;
    const owner=portrait?(v<.5?0:2)+(u<.5?0:1):u<.33?0:u<.5?1:u<.67?2:3;
    if((box?u<box.left||u>=box.right||Math.abs(v-box.cy)>(portrait?.17:.25):owner!==g)||pixels[(y*w+x)*4]<150)continue;
    const score=(u-tx)**2+(v-ty)**2;
    if(score<best){best=score;point=[u,v]}
   }
   result.push({x:point[0],y:point[1],glyph:g,side:k?1:-1,start:[.55,.92,.77,1.04,.68,.99,.84,.62][g*2+k]});
  }
 }
 return result;
}

export function arrivalAt(x,y,a,b,aspect){
 return Math.min(a.start+Math.hypot((x-a.x)*aspect,y-a.y)*6.8,b.start+Math.hypot((x-b.x)*aspect,y-b.y)*7.4);
}

// Contact attaches to the facing surface, not the interior stroke anchor.
// The anchor/front itself is unchanged. Find the first outgoing mask boundary.
export function contactSites(pixels,w,h,anchors){
 return anchors.map(a=>{let y=Math.floor(a.y*h),x=Math.min(w-1,Math.max(0,Math.floor(a.x*w)));
  for(let n=0;n<h*.24;n++){const next=y+a.side;if(next<1||next>=h-1||pixels[(next*w+x)*4]<135)break;y=next;}
  return{...a,surfaceX:a.x,surfaceY:(y+.5)/h};
 });
}

// Original bounded event director, not a fluid solver. Positions are in UV,
// lengths in viewport-height units. Every drop transfers its finite mass;
// the rest of each stroke condenses from the thin film (explicit reservoir).
export function entryDrop(age,a,i,aspect,out={},height=900){
 const contact=a.start+1.06,t=age-contact;
 const transfer=ease((t-.29)/.58),birth=ease(age/.65);
 const radius=.034+(i%3)*.003;
 const approach=ease((age-.1-i%3*.08)/(contact-.18));
 const pull=ease((t+.18)/.18);
 // Keep two identifiable surfaces on either side of a ~12px clear gap.
 const gap=(radius*1.13+.026)+(.103-radius*1.13-.026)*(1-approach)-.006*pull;
 const sx=a.surfaceX??a.x,sy=a.surfaceY??a.y;
 out.x=sx+(i%3-1)*.009*(1-approach)/aspect;
 out.y=sy+a.side*(gap*(1-transfer)-.009*transfer);
 out.radius=radius*Math.sqrt((1-transfer)*birth);
 out.stretch=.24*pull*(1-transfer);
 const thin=2.2/(.773*Math.max(600,height));
 out.neck=(thin*ease(t/.055)+(.012-thin)*ease((t-.19)/.23))*(1-transfer);
 out.mass=1-transfer;out.transferred=transfer;out.contact=contact;
 const settle=ease((t-.60)/.10)*(1-ease((t-.77)/.22));
 out.recoil=.0035*settle;out.rootX=sx;out.rootY=sy+a.side*.003*pull*(1-transfer);
 out.bulge=.005*pull*(1-transfer)+.013*settle;out.breakTime=0;
 return out;
}

export function exitDrop(age,a,i,aspect,out={},height=900){
 const delay=(i%3)*.015,t=Math.max(0,age-delay),travel=ease(t/.25);
 const sx=a.surfaceX??a.x,sy=a.surfaceY??a.y;
 const recoil=ease((t-.52)/.045)*(1-ease((t-.60)/.10));
 out.x=sx;out.y=sy+a.side*(.056*travel+.004*recoil);
 out.radius=.031*Math.sqrt(ease(t/.16)*(1-ease((t-.73)/.18)));
 out.stretch=(1-ease(t/.25))*.3;
 const thin=2.4/(.773*Math.max(600,height));
 out.neck=(.014+(thin-.014)*ease((t-.19)/.15))*(1-ease((t-.39)/.13));
 out.mass=clamp01((out.radius/.031)**2);out.transferred=0;
 out.recoil=-.003*recoil;out.rootX=sx;out.rootY=sy-a.side*.003*recoil;
 out.bulge=.012*(1-ease((t-.65)/.10));out.breakTime=.52+delay;
 return out;
}
