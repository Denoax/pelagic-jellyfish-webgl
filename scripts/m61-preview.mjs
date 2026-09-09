import {createServer} from 'vite';
import {resolve} from 'node:path';
// Separate worktree cache, kept under node_modules so the TSL transform does
// not process optimized dependencies. Shared existing dependency install only.
const server=await createServer({cacheDir:'node_modules/.vite-m61',optimizeDeps:{include:['three/webgpu','three/tsl']},server:{host:'127.0.0.1',port:5201,strictPort:true,fs:{allow:[resolve('..')]}}});
await server.listen();server.printUrls();
