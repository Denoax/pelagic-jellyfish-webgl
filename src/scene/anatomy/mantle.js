// Original procedural anatomy. One surface contract for mantle, margin and roots.
// t=0 apex, t=1 equator, t=1.12 softly rolled margin; roots insert at 1.1.
// Angle is periodic, including during contraction.
export function mantlePoint(t, angle, shape, lobes, current, out) {
  const polar=t*Math.PI*.5;
  const margin=t**5;
  const fold=Math.cos(angle*lobes);
  const radius=Math.sin(polar)*shape.radius*(1-.07*shape.pulse*margin)
    *(1+.012*fold*margin);
  out.x=Math.cos(angle)*radius+current.x*t*t*.08;
  out.y=Math.cos(polar)*shape.height+shape.rimY*t*t
    +margin*(fold*.014+shape.marginRoll*.04);
  out.z=Math.sin(angle)*radius+current.y*t*t*.08;
  return out;
}

export function membraneSection(t, u, phase, armIndex, out) {
  // Broad folded lamina, narrowed at the insertion and rounded at the tip.
  const width=(.055+.32*Math.sin(Math.PI*t)**.65)*Math.sqrt(Math.max(0,1-t**8));
  const edge=Math.abs(u);
  const foldPhase=t*22-armIndex*.8-phase*.42;
  // Accordion pleats, not a twisting flat sheet. Keep the insertion narrow and
  // central spine on the simulated centerline; flutter lives at the free edge.
  out.width=u*width*(1+.20*edge*Math.sin(t*30-armIndex));
  out.fold=(Math.sin(u*Math.PI*2+t*7+armIndex)-Math.sin(t*7+armIndex))*width*.30
    +Math.sin(t*30+u*2-armIndex)*width*.32*edge*edge
    +Math.sin(foldPhase)*width*.04*edge;
  return out;
}

export const TISSUE_STEP=1/60;
// Small position-based contact constraint between the four existing simulated
// oral spines. Same correction to Verlet history avoids artificial propulsion.
// Adjacent longitudinal samples cover oblique crossings, not only equal rows.
export function separateOralSpines(chains) {
  for(let pass=0;pass<3;pass++)for(let a=0;a<chains.length;a++)for(let b=a+1;b<chains.length;b++){
    const ca=chains[a].particles,cb=chains[b].particles;
    for(let i=1;i<ca.length;i++)for(let j=Math.max(1,i-2);j<=Math.min(cb.length-1,i+2);j++){
      const t=(i/(ca.length-1)+j/(cb.length-1))*.5;
      const clearance=.10+.82*Math.sin(Math.PI*t)**.7;
      const p=ca[i],q=cb[j];
      let x=q.position.x-p.position.x,y=q.position.y-p.position.y,z=q.position.z-p.position.z;
      const length=Math.hypot(x,y,z);
      if(length>=clearance)continue;
      if(length<1e-6){x=Math.cos(chains[b].angle)-Math.cos(chains[a].angle);y=0;z=Math.sin(chains[b].angle)-Math.sin(chains[a].angle);}
      const correction=Math.min(.035,(clearance-length)*.26)/Math.max(1e-6,Math.hypot(x,y,z));
      x*=correction;y*=correction;z*=correction;
      p.position.x-=x;p.position.y-=y;p.position.z-=z;
      p.previous.x-=x;p.previous.y-=y;p.previous.z-=z;
      q.position.x+=x;q.position.y+=y;q.position.z+=z;
      q.previous.x+=x;q.previous.y+=y;q.previous.z+=z;
    }
  }
}
export function boundedTissueDelta(delta) {
  return Number.isFinite(delta)&&delta>0&&delta<.25 ? Math.min(delta,.05) : 0;
}
