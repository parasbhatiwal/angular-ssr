import '../dist/angular-ssr/server/server.mjs';

export default async function handler(req, res) {
  const { default: server } = await import('../dist/angular-ssr/server/server.mjs');
  return server(req, res);
}