export default async function handler(req, res) {
  try {
    // Dynamically import the Angular server
    const { default: server } = await import('../dist/angular-ssr/server/server.mjs');
    
    // The server export is typically an Express app
    server.handle(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal Server Error');
  }
}