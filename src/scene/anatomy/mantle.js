// Original procedural anatomy. One surface contract for mantle, margin and roots.
// t=0 apex, t=1 attached margin; angle is periodic, including during contraction.
export function mantlePoint(t, angle, shape, lobes, current, out) {
  const polar=t*Math.PI*.5;
  const margin=t**5;
  const fold=Math.cos(angle*lobes);
  const radius=Math.sin(polar)*shape.radius*(1-.07*shape.pulse*margin)
    *(1+.012*fold*margin);
  out.x=Math.cos(angle)*radius+current.x*t*t*.08;
  out.y=Math.cos(polar)*shape.height+shape.rimY*t
    +margin*(fold*.014+shape.marginRoll*.04);
  out.z=Math.sin(angle)*radius+current.y*t*t*.08;
  return out;
}

export function membraneSection(t, u, phase, armIndex, out) {
  // Broad folded lamina, narrowed at the insertion and rounded at the tip.
  const width=(.12+.28*Math.sin(Math.PI*t)**.65)*Math.sqrt(Math.max(0,1-t**8));
  const edge=Math.abs(u);
  const foldPhase=t*22-armIndex*.8-phase*.42;
  out.width=u*width*(1+.12*edge*Math.sin(foldPhase));
  out.fold=Math.sin(u*Math.PI*2.5+t*8+armIndex)*width*.42
    +Math.sin(foldPhase+u*2)*width*.22*edge*edge;
  return out;
}

export const TISSUE_STEP=1/60;
export function boundedTissueDelta(delta) {
  return Number.isFinite(delta)&&delta>0&&delta<.25 ? Math.min(delta,.05) : 0;
}
