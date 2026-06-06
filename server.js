import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dist = resolve(__dirname, 'dist');
const port = process.env.PORT || 3000;

const mimeTypes = {
  html: 'text/html',
  js: 'application/javascript',
  css: 'text/css',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  json: 'application/json',
  txt: 'text/plain',
};

const server = createServer((req, res) => {
  let url = req.url.split('?')[0];
  let filePath = url === '/' ? '/index.html' : url;
  filePath = resolve(dist, '.' + filePath);

  if (!existsSync(filePath)) {
    filePath = resolve(dist, 'index.html');
  }

  const ext = extname(filePath).slice(1);
  const mime = mimeTypes[ext] || 'text/plain';

  try {
    const content = readFileSync(filePath);
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.writeHead(200);
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Numin running at http://0.0.0.0:${port}`);
});