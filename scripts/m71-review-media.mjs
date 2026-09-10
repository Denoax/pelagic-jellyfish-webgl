import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
// Actual browser footage only. These are enlarged inspection crops, not renders.
const root=resolve('../m7-1-evidence/candidate');
for(const[name,start,duration,filter]of[
 ['contact-close',.8,5,'crop=510:460:650:200,scale=1020:920,setpts=2*PTS'],
 ['exit-close',34,4.3,'crop=1040:600:120:150,scale=1248:720,setpts=2*PTS'],
]){
 const r=spawnSync('ffmpeg',['-n','-loglevel','error','-ss',String(start),'-i',root+'/sanctuary/motion.mp4','-t',String(duration*2),'-vf',filter,'-c:v','libx264','-preset','veryfast','-threads','2','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',root+'/'+name+'.mp4'],{stdio:'inherit'});
 if(r.status)throw Error('Crop failed: '+name);
}
