// Only the local review server supplies /publication-review.json. No guessed release URL.
if(location.hostname==='127.0.0.1'||location.hostname==='localhost'){
 fetch('/publication-review.json').then(r=>r.ok?r.json():null).then(config=>{
  if(!config?.motionAvailable)return;
  for(const video of document.querySelectorAll('video[data-clip]')){
   video.src=`/review-media/${video.dataset.clip}/motion.mp4`;
   video.closest('.technical').querySelector('.availability').textContent='Actual browser motion. Playback is optional and never automatic; metadata records capture conditions.';
  }
 }).catch(()=>{});
}
