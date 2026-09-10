import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m6-3-evidence/reference');
try {
 await b.send('Page.navigate',{url:'https://unseen.co/projects/blue-marine-foundation/'});await sleep(8000);
 await b.shot('author-entry');
 await b.ev(`(()=>{const e=[...document.querySelectorAll('button,a,div,span')].find(e=>e.textContent.trim()==='ENTER WITHOUT AUDIO');e?.click()})()`);await sleep(4000);
 b.save('author',await b.ev('({url:location.href,title:document.title,text:document.body.innerText,images:[...document.images].map(i=>({src:i.currentSrc,alt:i.alt}))})'));
 await b.ev('window.scrollTo(0,innerHeight*2.5)');await sleep(3000);await b.shot('author-worlds');
}finally{await b.close()}
