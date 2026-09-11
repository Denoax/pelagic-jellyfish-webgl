// Offline analysis of unmodified browser pixels. No exposure normalization.
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const [reference,baseline,candidate,outArg='../asset2-evidence/comparison']=process.argv.slice(2);
if(!reference||!baseline||!candidate)throw Error('reference baseline candidate [output directory]');
const out=resolve(outArg);mkdirSync(out,{recursive:true});
const W=1672,H=941,LW=64,LH=36;
function ff(args,input){const r=spawnSync('ffmpeg',['-v','error','-threads','1',...args],{input,maxBuffer:40e6});if(r.status)throw Error(r.stderr.toString());return r.stdout;}
function png(name,data,w=W,h=H){ff(['-y','-f','rawvideo','-pixel_format','rgb24','-video_size',`${w}x${h}`,'-i','-','-frames:v','1','-threads','1',`${out}/${name}.png`],data);}
function inspect(file,name){
  const raw=ff(['-i',file,'-vf',`scale=${W}:${H}`,'-f','rawvideo','-pix_fmt','rgb24','-']);
  const y=new Float32Array(W*H),low=new Float64Array(LW*LH),count=new Uint32Array(LW*LH),grey=Buffer.alloc(raw.length),falseColor=Buffer.alloc(raw.length),edges=Buffer.alloc(raw.length);
  const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  let dark1=0,dark2=0,center=0,cn=0,border=0,bn=0,edgeCount=0;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){
    const k=j*W+i,l=.2126*linear(raw[k*3]/255)+.7152*linear(raw[k*3+1]/255)+.0722*linear(raw[k*3+2]/255);y[k]=l;
    dark1+=l<.01;dark2+=l<.02;
    // Explicit reproducible central half and outer 10% frame; pack doesn't
    // specify how its center/border scalar was sampled. Do not claim equality.
    if(i>=W*.25&&i<W*.75&&j>=H*.25&&j<H*.75){center+=l;cn++;}
    if(i<W*.1||i>=W*.9||j<H*.1||j>=H*.9){border+=l;bn++;}
    const cell=Math.floor(j/H*LH)*LW+Math.floor(i/W*LW);low[cell]+=l;count[cell]++;
    const g=Math.round((l<=.0031308?12.92*l:1.055*l**(1/2.4)-.055)*255);grey.fill(g,k*3,k*3+3);
    const heat=Math.min(1,l/.025);falseColor[k*3]=Math.max(0,heat-.5)*510;falseColor[k*3+1]=Math.sin(heat*Math.PI)*180;falseColor[k*3+2]=(1-heat)*110;
  }
  for(let j=1;j<H-1;j++)for(let i=1;i<W-1;i++){
    const k=j*W+i,gx=-y[k-W-1]-2*y[k-1]-y[k+W-1]+y[k-W+1]+2*y[k+1]+y[k+W+1],gy=-y[k-W-1]-2*y[k-W]-y[k-W+1]+y[k+W-1]+2*y[k+W]+y[k+W+1];
    const e=Math.hypot(gx,gy);if(j>=H*2/3&&e>.006)edgeCount++;
    edges.fill(Math.min(255,e*4000),k*3,k*3+3);
  }
  for(let i=0;i<low.length;i++)low[i]/=count[i];
  const sorted=Float32Array.from(y).sort(),q=p=>sorted[Math.floor(p*(sorted.length-1))];
  png(`${name}-gray`,grey);png(`${name}-false-color`,falseColor);png(`${name}-edges`,edges);
  ff(['-y','-i',file,'-vf','gblur=sigma=28','-frames:v','1','-threads','1',`${out}/${name}-blur.png`]);
  return {low,metrics:{median:q(.5),p90:q(.9),p95:q(.95),p99:q(.99),fractionBelow01:dark1/y.length,fractionBelow02:dark2/y.length,centerMean:center/cn,borderMean:border/bn,centerBorderRatio:(center/cn)/(border/bn),floorEdgeDensity:edgeCount/(W*(H-Math.ceil(H*2/3)-1))}};
}
const r=inspect(reference,'reference'),b=inspect(baseline,'baseline'),c=inspect(candidate,'candidate');
const error=x=>x.low.reduce((sum,v,i)=>sum+Math.abs(v-r.low[i]),0)/r.low.length;
const result={method:{linear:'IEC sRGB to linear; Rec709 luma',lowFrequency:'64x36 linear-luma area means; no normalization',center:[.25,.25,.75,.75],border:'outer 10% on all edges',edges:'linear-luma Sobel magnitude > .006 in bottom third'},reference:r.metrics,baseline:{...b.metrics,lowFrequencyMAE:error(b)},candidate:{...c.metrics,lowFrequencyMAE:error(c)},relativeError:error(c)/error(b)};
// Diagnostic only: do not mask the official whole-image metric or normalize
// away the approved animal's mismatch with the art reference. Attribute error
// to bright reference cells separately so the exception is measurable.
const partition=x=>{let bright=0,dark=0,brightCells=0;for(let i=0;i<r.low.length;i++){const e=Math.abs(x.low[i]-r.low[i]);if(r.low[i]>.025){bright+=e;brightCells++;}else dark+=e;}return{brightCells,totalCells:r.low.length,brightReferenceError:bright/r.low.length,remainingError:dark/r.low.length,brightShare:bright/(bright+dark)};};
result.diagnosticErrorPartition={threshold:.025,notAnAcceptanceMetric:true,baseline:partition(b),candidate:partition(c)};
writeFileSync(`${out}/metrics.json`,JSON.stringify(result,null,2));
ff(['-y','-i',reference,'-i',baseline,'-i',candidate,'-filter_complex',`[0:v]scale=836:470[a];[1:v]scale=836:470[b];[2:v]scale=836:470[c];[a][b][c]vstack=inputs=3`,'-frames:v','1','-threads','1',`${out}/comparison.png`]);
console.log(JSON.stringify(result,null,2));
