import {browserSession,sleep} from './view-r2-browser.mjs';
for(const [name,url]of [['public','https://denoax.github.io/pelagic-jellyfish-webgl/'],['human-ocean','https://theseawebreathe.com/'],['vent-reference','https://oceanexplorer.noaa.gov/multimedia/ashes-venting/']]){
 const b=await browserSession('../m6-2-evidence/references/'+name);
 try{await b.send('Page.navigate',{url});await sleep(14000);await b.shot('entry');b.save('state',await b.ev('({url:location.href,title:document.title,text:document.body.innerText.slice(0,3000)})'));b.save('errors',b.errors);}finally{await b.close()}
}
