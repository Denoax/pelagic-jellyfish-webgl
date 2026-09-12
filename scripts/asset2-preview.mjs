// Local only. The second root is the immutable approved M7 worktree.
import { createServer } from 'vite';
import { resolve } from 'node:path';
const baseline = process.argv.includes('--baseline');
const root = baseline ? resolve('../asset2-approved-baseline') : process.cwd();
const server = await createServer({ root, cacheDir: resolve(`node_modules/.vite-asset2-${baseline ? 'baseline' : 'candidate'}`),
  optimizeDeps: { include: ['three/webgpu', 'three/tsl'] },
  server: { host: '127.0.0.1', port: baseline ? 5221 : 5222, strictPort: true, fs: { allow: [resolve('..')] } } });
await server.listen(); server.printUrls();
