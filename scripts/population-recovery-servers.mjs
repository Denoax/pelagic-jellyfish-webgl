import { createServer } from 'vite';
// Worktrees share installed packages, NOT Vite's mutable dependency cache.
const roots = ['/home/mani/dev/jellyfish-studio/m4-1-approved-baseline', process.cwd()];
const servers = [];
for (let i = 0; i < roots.length; i++) {
  const server = await createServer({ root: roots[i],
    cacheDir: `/home/mani/dev/jellyfish-studio/m4-1-evidence/node_modules/.vite-${i}`,
    optimizeDeps: { include: ['three/webgpu', 'three/tsl'] },
    server: { host: '127.0.0.1', port: 5188 + i, strictPort: true,
      fs: { allow: [roots[i], `${process.cwd()}/node_modules`] } } });
  await server.listen(); servers.push(server); server.printUrls();
}
process.on('SIGTERM', async () => { await Promise.all(servers.map(s => s.close())); process.exit(); });
