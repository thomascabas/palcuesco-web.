// Servidor de la tienda Palcuesco. No necesita instalar nada: solo Node.js.
// Railway lo arranca con "npm start" y le entrega el puerto en la variable PORT.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// Datos de contacto: se configuran en Railway > Variables
const config = {
  whatsapp: (process.env.WHATSAPP || '').replace(/\D/g, ''),
  email: (process.env.EMAIL || '').trim(),
  instagram: (process.env.INSTAGRAM || 'palcuesco').replace(/^@/, '').trim(),
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|manifest)|image\/svg)/;

const indexTemplate = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');

function origin(req) {
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  const safeHost = /^[a-z0-9.\-:]+$/i.test(host) ? host : 'localhost';
  return `${proto === 'https' ? 'https' : 'http'}://${safeHost}`;
}

function renderIndex(req) {
  const cfg = JSON.stringify(config).replace(/</g, '\\u003c');
  return indexTemplate
    .replace('/*CONFIG*/{}/*END*/', cfg)
    .replace(/%%ORIGIN%%/g, origin(req));
}

function send(req, res, status, type, body, cache) {
  const headers = {
    'Content-Type': type,
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  let data = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (COMPRESSIBLE.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '') && data.length > 1024) {
    data = zlib.gzipSync(data);
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  headers['Content-Length'] = data.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : data);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    return send(req, res, 400, 'text/plain; charset=utf-8', 'Solicitud no válida', 'no-store');
  }

  if (pathname === '/' || pathname === '/index.html') {
    return send(req, res, 200, TYPES['.html'], renderIndex(req), 'no-cache');
  }

  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!file.startsWith(PUBLIC + path.sep)) {
    return send(req, res, 404, 'text/plain; charset=utf-8', 'No encontrado', 'no-store');
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    send(req, res, 200, type, data, 'public, max-age=86400');
  });
});

server.listen(PORT, () => {
  console.log(`Palcuesco en el puerto ${PORT}`);
  if (!config.whatsapp) console.log('Aviso: falta la variable WHATSAPP; el botón de pedido no va a funcionar.');
});
