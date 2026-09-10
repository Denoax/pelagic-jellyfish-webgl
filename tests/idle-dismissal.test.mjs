import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

function hook(){
 const listeners=new Map(),docListeners=new Map(),scheduled=new Map();let next=0,cleanup,active;
 const context={URLSearchParams,Number,Math,performance:{now:()=>1000},useCallback:f=>f,useRef:v=>({current:v}),useState:v=>[v,x=>{active=x}],useEffect:f=>{cleanup=f()},
  window:{location:{search:'?idle=1'},clearTimeout:id=>scheduled.delete(id),setTimeout:f=>{scheduled.set(++next,f);return next},requestAnimationFrame:f=>f(),addEventListener:(name,f,options)=>listeners.set(name,{f,options}),removeEventListener:(name,f,capture)=>{assert.equal(capture,true);assert.equal(listeners.get(name).f,f);listeners.delete(name)}},
  document:{hidden:false,activeElement:null,addEventListener:(n,f)=>docListeners.set(n,f),removeEventListener:(n,f)=>{assert.equal(docListeners.get(n),f);docListeners.delete(n)}}};
 const src=readFileSync(new URL('../src/core/useIdleScreen.js',import.meta.url),'utf8').replace(/^import .*;\n/,'').replace('export function useIdleScreen','function useIdleScreen');
 runInNewContext(src+';useIdleScreen(true);',context);
 const enter=()=>{const fn=[...scheduled.values()].at(-1);scheduled.clear();fn();assert.equal(active,true)};
 const dispatch=(type,key)=>{let prevented=false,stopped=false;const l=listeners.get(type);assert.equal(l.options.capture,true);assert.equal(l.options.passive,false);l.f({type,key,preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}});return{prevented,stopped,active}};
 return{enter,dispatch,cleanup:()=>{cleanup();assert.equal(listeners.size,0);assert.equal(docListeners.size,0)},active:()=>active};
}
test('real hook keeps pointer movement active but consumes dismiss before ocean/View input',()=>{
 for(const[type,key]of[['pointerdown'],['touchstart'],['keydown','Enter'],['keydown','Escape'],['keydown',' ']]){
  const h=hook();h.enter();assert.deepEqual(h.dispatch('pointermove'),{prevented:false,stopped:false,active:true});
  assert.deepEqual(h.dispatch(type,key),{prevented:true,stopped:true,active:false});h.cleanup();
 }
});
test('idle hook cleans every capture listener after repeated enter/dismiss cycles',()=>{
 const h=hook();for(let i=0;i<25;i++){h.enter();h.dispatch('keydown','Enter')}h.cleanup();
});
