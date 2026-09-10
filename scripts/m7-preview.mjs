import {createServer} from 'vite';
import {resolve} from 'node:path';
const server=await createServer({cacheDir:'node_modules/.vite-m7',optimizeDeps:{include:['three/webgpu','three/tsl']},server:{host:'127.0.0.1',port:5215,strictPort:true,fs:{allow:[resolve('..')]}}});
await server.listen();server.printUrls();
