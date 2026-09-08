import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [before, after, output] = process.argv.slice(2);
if (!before || !after || !output) throw Error('Supply two matched capture directories and an output JSON');
const decode = path => {
  const r = spawnSync('/usr/bin/ffmpeg',['-v','error','-threads','1','-i',path,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],{maxBuffer:16*1024*1024});
  if (r.status) throw Error(r.stderr.toString()); return r.stdout;
};
const results = [];
for (const name of ['matched-bubbles','matched-ambient-only','matched-clear']) {
  const a = decode(`${before}/${name}.png`), b = decode(`${after}/${name}.png`);
  if (a.length !== b.length || a.length !== 1280*900*3) throw Error('Different or unexpected resolution');
  let sum=0,max=0,changedPixels=0,over3=0;
  for(let i=0;i<a.length;i+=3){let difference=0;for(let k=0;k<3;k++){
    const d=Math.abs(a[i+k]-b[i+k]);sum+=d;max=Math.max(max,d);difference=Math.max(difference,d);
  }if(difference)changedPixels++;if(difference>3)over3++;}
  results.push({name,meanAbsoluteChannelError:sum/a.length,maxChannelError:max,changedPixels,pixelsOver3:over3,totalPixels:a.length/3});
}
const report = {before,after,viewport:[1280,900],note:'Unmasked, unregistered, native-resolution RGB pixel comparison. Motion review remains necessary.',results};
writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
