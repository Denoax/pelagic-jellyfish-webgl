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

// Original bounded event director, not a fluid solver. Positions are in UV,
// lengths in viewport-height units. Every drop transfers its finite mass;
// the rest of each stroke condenses from the thin film (explicit reservoir).
export function entryDrop(age,a,i,aspect,out={}){
 const contact=a.start+.55,approach=ease((age-.1-i%3*.08)/(contact+.3));
 const transfer=ease((age-contact-.3)/1.05),birth=ease(age/.65);
 const dx=(i%3-1)*.026,dy=a.side*(.102+(i%2)*.018);
 const gap=1-approach*.76-ease((age-contact-.3)/1.05)*.24;
 out.x=a.x+dx*gap/aspect;out.y=a.y+dy*gap;
 out.radius=(.034+(i%3)*.003)*Math.sqrt((1-transfer)*birth);
 out.stretch=ease((age-contact+.4)/.5)*(1-transfer);
 out.neck=.020*ease((age-contact+.02)/.48)*(1-transfer);
 out.mass=1-transfer;out.transferred=transfer;out.contact=contact;
 // One finite compression/release, tied to absorption, not ambient wobble.
 const t=age-contact-.38;
 out.recoil=t>0&&t<1.8?Math.sin(t*8)*Math.exp(-t*3.8)*.004:0;
 return out;
}

export function exitDrop(age,a,i,aspect,out={}){
 const delay=(i%3)*.025,t=Math.max(0,age-delay),travel=ease(t/.85);
 out.x=a.x+(i%3-1)*.025*travel/aspect;out.y=a.y+a.side*.10*travel;
 out.radius=.031*Math.sqrt(ease(t/.18)*(1-ease((t-.62)/.35)));
 out.stretch=(1-ease(t/.7))*.65;
 out.neck=.021*(1-ease((t-.18)/.36));
 out.mass=clamp01((out.radius/.031)**2);out.transferred=0;
 out.recoil=t>.54?.004*Math.sin((t-.54)*10)*Math.exp(-(t-.54)*8):0;
 return out;
}
