// Original bounded controller. No wall-time catch-up, frame-count dynamics or
// world state writes. Keeping this pure makes lifecycle/timestep tests useful.
export const IDLE_STEP=1/60;
export const clamp01=x=>Math.min(1,Math.max(0,x));
export const ease=x=>{x=clamp01(x);return x*x*(3-2*x)};
export const clockDigits=date=>`${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}`;
export function fieldSize(w,h){const scale=256/Math.max(w,h);return[Math.max(64,Math.round(w*scale)),Math.max(64,Math.round(h*scale))]}
export function validPoint(e,w,h){return Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)&&Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0}
export const DROPLETS=Object.freeze(Array.from({length:8},(_,i)=>Object.freeze({
  x:[.16,.28,.43,.58,.73,.86,.36,.67][i],y:[.28,.64,.36,.67,.31,.60,.77,.22][i],
  radius:[.019,.028,.016,.023,.020,.013,.010,.012][i],phase:i*2.399963,
})));
export class IdleLiquidState {
  constructor(){this.active=false;this.age=0;this.exitAge=0;this.exitFrom=0;this.amount=0;this.time=0;this.accumulator=0;this.phase='ocean';}
  setActive(active){
    if(active===this.active)return;
    this.active=active;this.accumulator=0;
    if(active){this.age=0;this.exitAge=0;this.phase='condensing';}
    else{this.exitFrom=this.amount;this.exitAge=0;this.phase=this.amount?'dissolving':'ocean';}
  }
  advance(dt,hidden=false){
    if(hidden||!Number.isFinite(dt)||dt<0){this.accumulator=0;return 0}
    dt=Math.min(dt,.05);
    if(!this.active&&this.amount===0){this.accumulator=0;return 0}
    this.time+=dt;
    if(this.active){this.age+=dt;this.amount=ease(this.age/.55);this.phase=this.age<.8?'condensing':this.age<2.5?'coalescing':this.age<4?'forming':'settled';}
    else{this.exitAge+=dt;this.amount=this.exitFrom*(1-ease((this.exitAge-.55)/.3));if(this.amount===0)this.phase='ocean';}
    this.accumulator=Math.min(this.accumulator+dt,3*IDLE_STEP);
    const steps=Math.min(3,Math.floor((this.accumulator+1e-10)/IDLE_STEP));this.accumulator-=steps*IDLE_STEP;
    return steps;
  }
  get clockGrowth(){return ease((this.age-.5)/3.3)}
  get erosion(){return this.active?0:ease(this.exitAge/.85)}
}
