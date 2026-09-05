import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
const [
  mode = "idle",
  url = "http://127.0.0.1:4173/?idle=12",
  out = "/tmp/pelagic-audit",
  width = "1440",
  height = "900",
] = process.argv.slice(2);
const port = Number(process.env.CDP_PORT || 9251);
const profile = mkdtempSync("/tmp/pelagic-audit-browser-");
const browser = spawn(
  process.env.CHROME_BIN ||
    fileURLToPath(new URL("./brave-headless.sh", import.meta.url)),
  [
    "--headless=new",
    "--no-sandbox",
    "--hide-scrollbars",
    "--use-gl=angle",
    `--use-angle=${mode === "software" ? "swiftshader-webgl" : "gl"}`,
    "--enable-unsafe-swiftshader",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let socket;
let closeBrowser;
try {
  let page;
  for (let i = 0; i < 80; i++) {
    try {
      page = await (
        await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
          method: "PUT",
        })
      ).json();
      break;
    } catch {
      await sleep(100);
    }
  }
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => socket.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener("message", ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) {
      pending.get(m.id)?.(m);
      pending.delete(m.id);
    } else if (
      m.method === "Runtime.exceptionThrown" ||
      (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
    )
      errors.push(m.params);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) =>
        m.error ? reject(Error(JSON.stringify(m.error))) : resolve(m.result),
      );
      socket.send(JSON.stringify({ id: n, method, params }));
    });
  const evaluate = async (expression) =>
    (
      await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
    ).result?.value;
  closeBrowser = () => send("Browser.close");
  await send("Page.enable");
  await send("Runtime.enable");
  if (mode === "reduced")
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  await send("Emulation.setDeviceMetricsOverride", {
    width: +width,
    height: +height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
    window.__audit={frames:[],long:[],contexts:[],draws:0,started:performance.now()};
    window.__audit.startupPosterSeen=false;
    new MutationObserver(()=>{
      if(document.querySelector('.ocean-stage--loading .ocean-fallback'))window.__audit.startupPosterSeen=true;
    }).observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    window.__audit.shaders=[];
    const shaderSource=WebGL2RenderingContext.prototype.shaderSource;
    WebGL2RenderingContext.prototype.shaderSource=function(shader,source){window.__audit.shaders.push(source);return shaderSource.call(this,shader,source);};
    if(${JSON.stringify(mode)}==='fallback'){
      Object.defineProperty(navigator,'brave',{value:undefined,configurable:true});
      Object.defineProperty(navigator,'gpu',{value:{requestAdapter:async()=>null},configurable:true});
    }
    if(${JSON.stringify(mode)}==='gpu')Object.defineProperty(navigator,'brave',{value:undefined,configurable:true});
    const extension=WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension=function(name){
      if(${JSON.stringify(mode)}==='gel-byte' && name==='EXT_color_buffer_float' && this===window.__audit.contexts[1]?.gl)return null;
      return extension.call(this,name);
    };
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(${JSON.stringify(mode)}==='blocked' && /webgl|webgpu/.test(type))return null;
      const gl=original.call(this,type,...args);
      if(gl && /webgl/.test(type) && !window.__audit.contexts.some(x=>x.gl===gl)) {
        const ext=gl.getExtension('WEBGL_debug_renderer_info');
        window.__audit.contexts.push({gl,type,at:performance.now(),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
      }
      return gl;
    };
    for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const orig=proto[name];if(orig)proto[name]=function(...args){window.__audit.draws++;return orig.apply(this,args);};}
    new PerformanceObserver(list=>{for(const e of list.getEntries())window.__audit.long.push({at:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
    let prev=performance.now(),draws=0;
    function tick(now){const a=window.__audit;a.frames.push({at:now,dt:now-prev,draws:a.draws-draws,idle:!!document.querySelector('.idle-screen.is-active'),opacity:Number(getComputedStyle(document.querySelector('.idle-screen')||document.body).opacity)});prev=now;draws=a.draws;requestAnimationFrame(tick);}requestAnimationFrame(tick);
  `,
  });
  await send("Page.navigate", { url });
  if (mode === "floor") {
    await sleep(4500);
    await evaluate(
      "document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,document.documentElement.scrollHeight-innerHeight)",
    );
    await sleep(4500);
    console.log(
      await evaluate(
        "JSON.stringify(window.__JELLYFISH_WORLD__?.getDeepState())",
      ),
    );
    const capture = async (name) => {
      const img = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(out + "-" + name + ".png", Buffer.from(img.data, "base64"));
    };
    await capture("fog");
    writeFileSync(
      out + "-shaders.txt",
      (await evaluate("window.__audit.shaders")).join("\nNEXT_SHADER\n"),
    );
    await evaluate("window.__JELLYFISH_WORLD__.scene.fogNode=null");
    await sleep(2000);
    await capture("no-fog");
  } else if (mode === "gel" || mode === "gel-byte") {
    await sleep(9000);
    const capture = async (name) => {
      const img = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(out + "-" + name + ".png", Buffer.from(img.data, "base64"));
    };
    const sample = () =>
      evaluate(`(()=>{
      const g=window.__PELAGIC_GEL__,s=g.getState(),target=g.targets[s.current];
      const data=s.floatTargets?new Uint16Array(target.width*target.height*4):new Uint8Array(target.width*target.height*4);
      g.renderer.readRenderTargetPixels(target,0,0,target.width,target.height,data);
      const half=v=>{const e=(v>>10)&31,f=v&1023;return (v&32768?-1:1)*(e===0?Math.pow(2,-14)*f/1024:Math.pow(2,e-15)*(1+f/1024));};
      let max=0,total=0;
      for(let i=0;i<data.length;i+=4){const x=(s.floatTargets?half(data[i+2]):(data[i]*256+data[i+1]-32768)/65535)*.36,y=(s.floatTargets?half(data[i+3]):(data[i+2]*256+data[i+3]-32768)/65535)*.36;const d=Math.hypot(x,y);max=Math.max(max,d);total+=d*d;}
      return {...s,maxDisplacement:max,rmsDisplacement:Math.sqrt(total/(data.length/4)),idle:document.querySelector('.idle-screen').className};
    })()`);
    const samples = [{ label: "rest", ...(await sample()) }];
    await capture("rest");
    for (let i = 0; i < 25; i++) {
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: +width * (0.24 + i * 0.022),
        y: +height * (0.5 + Math.sin(i * 0.18) * 0.12),
      });
      await sleep(30);
    }
    samples.push({ label: "drag", ...(await sample()) });
    await capture("drag");
    await sleep(900);
    samples.push({ label: "wake", ...(await sample()) });
    await capture("wake");
    await sleep(5000);
    samples.push({ label: "settled", ...(await sample()) });
    await capture("settled");
    await evaluate(
      "window.__realDate=Date;window.Date=class extends window.__realDate{constructor(...args){super(...(args.length?args:[window.__realDate.now()+60000]));}}",
    );
    await sleep(3400);
    samples.push({ label: "minute", ...(await sample()) });
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await sleep(3000);
    samples.push({ label: "dismissed", ...(await sample()) });
    await sleep(4500);
    samples.push({ label: "repeat", ...(await sample()) });
    writeFileSync(out + "-gel.json", JSON.stringify(samples, null, 2));
    console.log(JSON.stringify(samples));
    if (
      samples[0].maxDisplacement > 0.0003 ||
      samples[3].maxDisplacement > 0.001 ||
      samples[1].maxDisplacement < 0.015 ||
      samples[2].maxDisplacement < 0.002 ||
      samples[3].maxDisplacement > samples[1].maxDisplacement * 0.3
    )
      throw Error("Gel did not retain and recover its displacement");
  } else if (mode === "idle" || mode === "profile") {
    await sleep(9000);
    for (const [name, wait] of [
      ["ocean", 0],
      ["enter", 4200],
      ["idle", 3800],
      ["release", 0],
    ]) {
      await sleep(wait);
      if (name === "release") {
        for (let i = 0; i < 16; i++) {
          await send("Input.dispatchMouseEvent", {
            type: "mouseMoved",
            x: +width * (0.28 + i * 0.027),
            y: +height * (0.5 + Math.sin(i * 0.3) * 0.08),
          });
          await sleep(35);
        }
      }
      if (mode !== "profile") {
        const img = await send("Page.captureScreenshot", { format: "png" });
        writeFileSync(
          out + "-" + name + ".png",
          Buffer.from(img.data, "base64"),
        );
      }
    }
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await sleep(3500);
  } else {
    await sleep(mode === "software" ? 14000 : 9000);
    if (mode === "loss") {
      await evaluate(
        "window.__audit.contexts[0]?.gl.getExtension('WEBGL_lose_context')?.loseContext()",
      );
      await sleep(3000);
    }
    const img = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(out + ".png", Buffer.from(img.data, "base64"));
  }
  const report = await evaluate(
    `(()=>{const a=window.__audit;const stats=(lo,hi)=>{const f=a.frames.filter(x=>x.at>=lo&&x.at<hi);const times=f.map(x=>x.dt).sort((a,b)=>a-b);return {frames:f.length,mean:times.reduce((s,n)=>s+n,0)/(times.length||1),p95:times[Math.floor(times.length*.95)],max:times.at(-1),drawFrames:f.filter(x=>x.draws>0).length,draws:f.reduce((s,x)=>s+x.draws,0)};};return {status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,worldRenderer:window.__JELLYFISH_WORLD__?.renderer,canvasCount:document.querySelectorAll('canvas').length,contexts:a.contexts.map(({type,at,renderer})=>({type,at,renderer})),windows:[{label:'startup',...stats(0,5000)},{label:'ocean',...stats(5000,11000)},{label:'entry',...stats(11500,15000)},{label:'idle',...stats(15000,19000)},{label:'exit',...stats(19000,24000)}],longTasks:a.long,frames:a.frames,assets:performance.getEntriesByType('resource').map(x=>({name:x.name,duration:x.duration,transfer:x.transferSize})),text:document.body.innerText};})()`,
  );
  report.startupPosterSeen = await evaluate("window.__audit.startupPosterSeen");
  writeFileSync(
    out + ".json",
    JSON.stringify({ mode, url, width, height, ...report, errors }, null, 2),
  );
  const { frames, assets, ...brief } = report;
  console.log(JSON.stringify({ ...brief, errorCount: errors.length }));
  if (report.startupPosterSeen) throw Error("Startup displayed the rejected static poster");
  if (
    mode === "fallback" &&
    (report.status !== "ready" || report.worldRenderer !== "WebGL 2")
  )
    throw Error("Automatic backend fallback failed");
  if (
    ["blocked", "loss"].includes(mode) &&
    (report.status !== "error" ||
      !report.text.includes("compatibility renderer"))
  )
    throw Error("Graphics failure did not expose recovery");
  if (
    mode === "reduced" &&
    (report.status !== "still" || report.contexts.length)
  )
    throw Error("Reduced motion started graphics work");
} finally {
  if (closeBrowser)
    await Promise.race([closeBrowser().catch(() => {}), sleep(1000)]);
  socket?.close();
  browser.kill("SIGTERM");
  await sleep(200);
  rmSync(profile, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });
}
