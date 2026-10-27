/* Genera content/clientes.json a partir de los logos que haya en /clientes.
   Netlify lo ejecuta en cada deploy (ver netlify.toml). Solo deja el archivo del logo en
   /clientes (png, svg, webp o jpg); el nombre del archivo se usa como texto alternativo:
   "emotiva.png" -> "emotiva", "grupo-acme.svg" -> "grupo acme". */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dir = path.join(root, 'clientes');
const out = path.join(root, 'content', 'clientes.json');
const ok = /\.(png|svg|webp|jpe?g|avif)$/i;
let files = [];
try { files = fs.readdirSync(dir).filter(f => ok.test(f) && !f.startsWith('.')).sort(); } catch (e) {}
const logos = files.map(f => ({ name: f.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim(), src: '/clientes/' + f }));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ logos }, null, 2) + '\n');
console.log('clientes.json:', logos.length, 'logo(s)');
