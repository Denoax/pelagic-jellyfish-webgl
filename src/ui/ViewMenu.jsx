import { useEffect, useRef, useState } from 'react';
import { CaretDown, Check, X, ArrowUp, ArrowDown, Question } from '@phosphor-icons/react';
import { viewModes } from '../scene/camera/viewPreferences.js';
import './view-menu.css';

export function ViewMenu({ controller, idle }) {
  const [state,setState]=useState(()=>controller.summary());
  const [open,setOpen]=useState(false),[expert,setExpert]=useState(false),[authoring,setAuthoring]=useState(false);
  const [grid,setGrid]=useState(false),[text,setText]=useState(()=>controller.authoring());
  const [notice,setNotice]=useState(''),[error,setError]=useState(''),[fov,setFov]=useState(()=>String(state.fixedFov));
  const [hint,setHint]=useState(false),[hintEpoch,setHintEpoch]=useState(0);
  const trigger=useRef(null),menu=useRef(null),editorClose=useRef(null),canvas=useRef(null),fileUrl=useRef(null),drafts=useRef({});
  const current=viewModes.find(m=>m.id===state.mode);
  useEffect(()=>controller.subscribe(setState),[controller]);
  useEffect(()=>{setText(drafts.current[state.direction]||controller.authoring());setFov(String(state.fixedFov));setError('');},[controller,state.direction,state.fixedFov]);
  useEffect(()=>{if(grid&&!idle)controller.draw(canvas.current);},[controller,grid,idle,state]);
  useEffect(()=>{
    if(!state.free||idle){setHint(false);return;}
    setHint(true);const timer=setTimeout(()=>setHint(false),4000);
    return()=>clearTimeout(timer);
  },[state.free,hintEpoch,idle]);
  useEffect(()=>{if(idle){controller.keys.clear();setOpen(false);setExpert(false);setGrid(false);}},[controller,idle]);
  useEffect(()=>()=>{if(fileUrl.current)URL.revokeObjectURL(fileUrl.current);},[]);
  const close=()=>{setOpen(false);setExpert(false);controller.persist({expanded:false});trigger.current?.focus({preventScroll:true});};
  const choose=id=>{drafts.current[state.direction]=text;controller.select(id);if(id==='explore')setHintEpoch(n=>n+1);setNotice('');close();};
  const disclose=()=>{
    if(open){close();return;}setExpert(false);setOpen(true);
    requestAnimationFrame(()=>menu.current?.querySelector(`[data-mode="${state.mode}"]`)?.focus({preventScroll:true}));
  };
  const openExpert=()=>{setOpen(false);setExpert(true);requestAnimationFrame(()=>editorClose.current?.focus({preventScroll:true}));};
  useEffect(()=>{
    const key=e=>{if(e.key!=='Escape'||idle)return;if(open||expert){e.preventDefault();close();}else if(state.free){e.preventDefault();controller.select(state.direction);trigger.current?.focus({preventScroll:true});}};
    const outside=e=>{if((open||expert)&&!e.target.closest?.('[data-view-ui]')){setOpen(false);setExpert(false);}};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
  },[open,expert,state.free,state.direction,idle,controller]);
  const menuKey=e=>{
    const items=[...menu.current.querySelectorAll('[role^=menuitem]')],i=items.indexOf(document.activeElement);
    const n=e.key==='ArrowDown'?(i+1)%items.length:e.key==='ArrowUp'?(i+items.length-1)%items.length:e.key==='Home'?0:e.key==='End'?items.length-1:null;
    if(n!==null){e.preventDefault();items[n].focus();}else if(e.key==='Tab')setOpen(false);
  };
  const action=fn=>{try{fn();setError('');}catch(e){setError(e.message);setNotice('');}};
  const exportPoses=()=>action(()=>{
    const data=controller.export(text);if(fileUrl.current)URL.revokeObjectURL(fileUrl.current);
    fileUrl.current=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    const a=document.createElement('a');a.href=fileUrl.current;a.download=`pelagic-${current.name.toLowerCase()}-camera.json`;a.click();setNotice('Camera path exported.');
  });
  const hold=code=>({onPointerDown:e=>{e.currentTarget.setPointerCapture(e.pointerId);controller.keys.add(code);},onPointerUp:()=>controller.keys.delete(code),onPointerCancel:()=>controller.keys.delete(code),onLostPointerCapture:()=>controller.keys.delete(code),onKeyDown:e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();controller.keys.add(code);}},onKeyUp:()=>controller.keys.delete(code),onBlur:()=>controller.keys.delete(code)});
  return <>
    <canvas ref={canvas} className="view-guides" hidden={!grid||idle} aria-hidden="true"/>
    <div className="view-ui" data-view-ui hidden={idle}>
      <div className="view-chrome">
        <button ref={trigger} className="view-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls="view-menu" onClick={disclose} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();disclose();}}}>VIEW <span>· {current.name}</span><CaretDown aria-hidden="true"/></button>
        {state.free&&<>
          <button className="view-help-button" aria-label="Show Explore controls" onClick={()=>setHintEpoch(n=>n+1)}><Question aria-hidden="true"/></button>
          <button className="view-exit" onClick={()=>choose(state.direction)}>Exit Explore</button>
          <div className="view-touch-move"><button aria-label="Explore forward" {...hold('KeyW')}><ArrowUp aria-hidden="true"/></button><button aria-label="Explore backward" {...hold('KeyS')}><ArrowDown aria-hidden="true"/></button></div>
        </>}
      </div>
      <div ref={menu} className="view-menu" id="view-menu" role="menu" aria-label="Choose a view" hidden={!open} onKeyDown={menuKey}>
        {viewModes.map(mode=><button role="menuitemradio" tabIndex={-1} aria-checked={mode.id===state.mode} data-mode={mode.id} key={mode.id} onClick={()=>choose(mode.id)}>{mode.name}{mode.id===state.mode&&<Check aria-hidden="true"/>}</button>)}
        <button role="menuitem" tabIndex={-1} className="view-advanced-link" onClick={openExpert}>Advanced</button>
      </div>
      <section className="view-editor" data-view-editor role="dialog" aria-modal="false" aria-label="Advanced view tools" hidden={!expert}>
        <header><h2>Advanced</h2><button ref={editorClose} aria-label="Close advanced tools" onClick={close}><X aria-hidden="true"/></button></header>
        <details className="view-lens"><summary>Lens & composition</summary><label>Fixed field of view <input aria-label="Fixed field of view in degrees" type="number" min="35" max="80" value={fov} onChange={e=>setFov(e.target.value)} onBlur={()=>action(()=>{controller.setFov(Number(fov));setText(controller.authoring());})} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}}}/></label><label><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/>Thirds & actor envelopes</label></details>
        <details className="view-diagnostics"><summary>Response & diagnostics</summary><label>Response<select value={state.response} onChange={e=>controller.setResponse(e.target.value)}><option value="cinematic">Cinematic</option><option value="balanced">Balanced</option><option value="responsive">Responsive</option></select></label><p>Changes catch-up, not the speed ceiling.</p>{import.meta.env.DEV&&controller.telemetry&&<output className="view-telemetry">{JSON.stringify({input:controller.telemetry.at(-1)?.normalized,target:state.destination,actual:state.progress,velocity:state.velocity,acceleration:state.acceleration,lead:state.lead,capped:state.leadClamped},null,2)}</output>}</details>
        <details className="view-authoring" open={authoring} onToggle={e=>setAuthoring(e.currentTarget.open)}><summary>Authoring</summary>
          {authoring&&<><label>Journey position <input className="view-authoring-range" aria-label="Authoring journey position" type="range" min="0" max="1" step=".001" value={state.progress} onChange={e=>controller.seek(Number(e.target.value))}/></label><p>Explicit pose inspection, not automatic playback.</p>
          <div className="view-pose-buttons"><button onClick={()=>action(()=>{setText(controller.savePose(text));setNotice('Pose saved to the draft. Apply to preview.');})}>Save pose</button><button onClick={()=>action(()=>{controller.apply(text);setNotice('Edited path applied.');})}>Apply edits</button></div>
          <label htmlFor="view-json">Camera path JSON</label><textarea id="view-json" spellCheck="false" value={text} onChange={e=>setText(e.target.value)} aria-describedby="view-json-help"/><p id="view-json-help">Ordered poses from 0 to 1. Export to keep changes after reload.</p><button className="view-export" onClick={exportPoses}>Export JSON</button>
          {state.free&&<div className="view-move-pad">{[['KeyW','Forward'],['KeyQ','Down'],['KeyE','Up'],['KeyA','Left'],['KeyS','Back'],['KeyD','Right']].map(([code,label])=><button key={code} {...hold(code)}>{label}</button>)}</div>}</>}
        </details>
        <p role="status">{notice}</p><p role="alert" className="view-error">{error}</p>
      </section>
    </div>
    <p className={`explore-hint ${hint&&!idle?'is-visible':''}`} aria-hidden={!hint||idle} role="status"><span className="explore-hint-desktop">RIGHT-DRAG TO LOOK · WASD MOVE · Q DOWN / E UP · ESC EXIT</span><span className="explore-hint-touch">DRAG TO LOOK · HOLD ARROWS TO MOVE · EXIT EXPLORE TO RETURN</span></p>
  </>;
}
