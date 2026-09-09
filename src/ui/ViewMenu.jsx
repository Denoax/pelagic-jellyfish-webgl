import { useEffect, useRef, useState } from 'react';
import { CaretDown, Play, Pause, ArrowCounterClockwise, Check, X } from '@phosphor-icons/react';
import { viewModes } from '../scene/camera/viewPreferences.js';
import './view-menu.css';

export function ViewMenu({ controller, idle }) {
  const [state,setState]=useState(()=>controller.summary());
  const [open,setOpen]=useState(()=>controller.preferences.expanded);
  const [advanced,setAdvanced]=useState(()=>new URLSearchParams(location.search).get('expert')==='1');
  const [grid,setGrid]=useState(false),[text,setText]=useState(()=>controller.authoring());
  const [notice,setNotice]=useState(''),[error,setError]=useState('');
  const [fovDraft,setFovDraft]=useState(()=>String(controller.summary().fixedFov));
  const drafts=useRef({});
  const trigger=useRef(null),panel=useRef(null),canvas=useRef(null),fileUrl=useRef(null);
  const current=viewModes.find(m=>m.id===state.mode),moving=!state.paused&&(state.playing||Math.abs(state.destination-state.progress)>.0002);
  useEffect(()=>controller.subscribe(setState),[controller]);
  useEffect(()=>{setText(drafts.current[state.direction]||controller.authoring());setNotice('');setError('');},[controller,state.direction]);
  useEffect(()=>setFovDraft(String(state.fixedFov)),[state.fixedFov,state.direction]);
  useEffect(()=>{if(grid&&!idle)controller.draw(canvas.current);},[controller,state,grid,idle]);
  useEffect(()=>{if(idle){controller.keys.clear();setGrid(false);}},[controller,idle]);
  useEffect(()=>()=>{if(fileUrl.current)URL.revokeObjectURL(fileUrl.current);},[]);
  const disclose=value=>{setOpen(value);controller.persist({expanded:value});if(!value)trigger.current?.focus();};
  useEffect(()=>{
    if(!open||idle)return;
    const key=e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);controller.persist({expanded:false});trigger.current?.focus();}};
    const outside=e=>{if(!e.target.closest?.('[data-view-ui]')){setOpen(false);controller.persist({expanded:false});}};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
  },[open,idle,controller]);
  const action=fn=>{try{fn();setError('');}catch(e){setError(e.message);setNotice('');}};
  const changeMode=id=>{drafts.current[state.direction]=text;controller.select(id);setNotice('');};
  const applyFov=()=>action(()=>{controller.setFov(Number(fovDraft));setText(controller.authoring());});
  const exportPoses=()=>action(()=>{
    const data=controller.export(text);if(fileUrl.current)URL.revokeObjectURL(fileUrl.current);
    fileUrl.current=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    const a=document.createElement('a');a.href=fileUrl.current;a.download=`pelagic-${current.name.toLowerCase()}-camera.json`;a.click();setNotice('Camera path exported.');
  });
  return <>
    <canvas ref={canvas} className="view-guides" hidden={!grid||idle} aria-hidden="true" />
    <div className="view-ui" data-view-ui hidden={idle}>
      <button className="view-trigger" ref={trigger} onClick={()=>disclose(!open)} aria-expanded={open} aria-controls="view-panel" aria-label={`View: ${current.name}. ${open?'Close':'Open'} view controls`}>
        View <span className="view-trigger-mode">{current.name}</span><CaretDown aria-hidden="true" className={open?'is-open':''}/>
      </button>
      <section className="view-panel" id="view-panel" ref={panel} hidden={!open} aria-label="View controls">
        <div className="view-heading"><div><h2>View</h2><p>Choose how you experience the dive.</p></div><button className="view-icon" aria-label="Close view controls" onClick={()=>disclose(false)}><X aria-hidden="true"/></button></div>
        <fieldset className="view-modes"><legend className="view-label">Your perspective</legend>
          {viewModes.map(mode=><label className={`view-mode ${state.mode===mode.id?'is-selected':''}`} key={mode.id}>
            <input type="radio" name="pelagic-view" value={mode.id} checked={state.mode===mode.id} onChange={()=>changeMode(mode.id)}/>
            <span><strong>{mode.name}</strong><small>{mode.description}</small></span><Check aria-hidden="true"/>
          </label>)}
        </fieldset>
        {!state.free ? <div className="view-playback">
          <div className="view-playback-buttons"><button className="view-primary" onClick={()=>controller.togglePlayback()}>{moving?<Pause aria-hidden="true"/>:<Play aria-hidden="true"/>}{moving?'Pause':'Play'}</button><button className="view-secondary" onClick={()=>controller.replay()}><ArrowCounterClockwise aria-hidden="true"/>Replay</button></div>
          <div className="view-progress-caption"><label htmlFor="view-progress">Journey</label><output htmlFor="view-progress">{Math.round(state.progress*100)}%</output></div>
          <input id="view-progress" className="view-range" type="range" min="0" max="100" step=".1" value={state.destination*100} aria-valuetext={`${Math.round(state.destination*100)} percent requested; ${Math.round(state.progress*100)} percent reached`} onChange={e=>controller.request(Number(e.target.value)/100)}/>
          <p className="view-hint">{state.replaying?'Returning to the start, then replaying.':state.paused?'Journey paused. The ocean keeps moving.':Math.abs(state.destination-state.progress)>.015?`Gliding toward ${Math.round(state.destination*100)}%. Scroll sets the destination.`:'Scroll to travel. The pace stays gentle.'}</p>
        </div> : <div className="view-explore"><p>Hold right-click to look. <kbd>WASD</kbd> to move; <kbd>Q E</kbd> to rise or descend. On touch, drag the ocean to look.</p><div className="view-move-pad" aria-label="Explore movement">
          {[['KeyW','Forward'],['KeyQ','Down'],['KeyE','Up'],['KeyA','Left'],['KeyS','Back'],['KeyD','Right']].map(([code,label])=><button key={code} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);controller.keys.add(code);}} onPointerUp={()=>controller.keys.delete(code)} onPointerCancel={()=>controller.keys.delete(code)} onLostPointerCapture={()=>controller.keys.delete(code)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();controller.keys.add(code);}}} onKeyUp={()=>controller.keys.delete(code)} onBlur={()=>controller.keys.delete(code)}>{label}</button>)}
        </div><p className="view-hint">Choose another view to rejoin the same journey.</p></div>}
        <details className="view-advanced" open={advanced} onToggle={e=>setAdvanced(e.currentTarget.open)}>
          <summary>Advanced <span>Lens, guides & pose tools</span><CaretDown aria-hidden="true"/></summary>
          <div className="view-expert-fields">
            <fieldset><legend className="view-label">Motion & lens</legend><label className="view-field">Response<select value={state.response} onChange={e=>controller.setResponse(e.target.value)}><option value="cinematic">Cinematic</option><option value="balanced">Balanced</option><option value="responsive">Responsive</option></select></label><p className="view-hint">Changes the ease-in, not the speed limit.</p>
              <label className="view-field">Fixed field of view <span><input aria-label="Fixed field of view in degrees" type="number" min="35" max="80" value={fovDraft} onChange={e=>setFovDraft(e.target.value)} onBlur={applyFov} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}}}/> °</span></label>
            </fieldset>
            <fieldset><legend className="view-label">Composition guides</legend><label className="view-checkbox"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/>Thirds & actor envelopes</label><p className="view-hint">Envelopes are rough guides, not exact anatomy.</p></fieldset>
            <fieldset><legend className="view-label">Pose tools</legend><p className="view-hint">Explore to frame a pose. Save it at the current journey position, then apply your edits.</p><div className="view-pose-buttons"><button onClick={()=>action(()=>{setText(controller.savePose(text));setNotice('Pose saved to the editor. Apply to preview it.');})}>Save pose</button><button onClick={()=>action(()=>{controller.apply(text);setNotice('Edited path applied.');})}>Apply edits</button></div>
              <label className="view-editor-label" htmlFor="view-json">Camera path JSON</label><textarea id="view-json" spellCheck="false" value={text} onChange={e=>setText(e.target.value)} aria-describedby="view-json-help"/><p id="view-json-help" className="view-hint">Edit or reorder poses; progress must increase from 0 to 1. Changes stay in this session unless exported.</p><button className="view-export" onClick={exportPoses}>Export JSON</button>
            </fieldset>
          </div>
        </details>
        <p role="status" className="view-notice">{notice}</p><p role="alert" className="view-error">{error}</p>
      </section>
    </div>
  </>;
}
