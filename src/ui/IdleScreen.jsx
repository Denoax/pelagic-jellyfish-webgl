import {useEffect} from 'react';

// Input/semantic surface only. Idle pixels belong to the ocean renderer.
export function IdleScreen({enabled,active}) {
  const visible=enabled&&active;
  useEffect(()=>{
    document.documentElement.classList.toggle('idle-active',visible);
    return()=>document.documentElement.classList.remove('idle-active');
  },[visible]);
  return <div className={`idle-screen ${visible?'is-active':''}`} aria-hidden="true" data-testid="idle-screen" data-ready={enabled}/>;
}
