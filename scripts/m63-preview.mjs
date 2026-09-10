import {createServer} from 'vite';
import {resolve} from 'node:path';
const server=await createServer({cacheDir:'node_modules/.vite-m63',optimizeDeps:{include:['three/webgpu','three/tsl']},server:{host:'127.0.0.1',port:5205,strictPort:true,fs:{allow:[resolve('..')]}}});
await server.listen();server.printUrls();
