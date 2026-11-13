/* Genera el espacio de entregables para clientes.
   Netlify lo ejecuta en cada deploy (ver netlify.toml). Tú solo subes archivos:

   entregables/
     emotiva-7k2q/                 <- una carpeta por cliente (el nombre es parte del enlace)
       _cliente.json               <- opcional: {"nombre": "EMOTIVA", "mensaje": "..."}
       diagnostico-de-datos.html   <- lo que descargas de Claude (HTML) ...
       2026-11-12_propuesta.pdf    <- ... o un PDF. La fecha al inicio del nombre es opcional.

   Resultado publicado:
     /entregables/emotiva-7k2q/                         portal con todos sus entregables
     /entregables/emotiva-7k2q/diagnostico-de-datos/    el entregable con tu marca arriba
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const base = path.join(root, 'entregables');
const MARK = '.mp-generado';
const OK = /\.(html?|pdf)$/i;
const WA = 'https://wa.me/522221580381';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entregable';
const pretty = s => { const t = s.replace(/[-_]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fecha = iso => { if (!iso) return ''; const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return d + ' de ' + MESES[m - 1] + ' de ' + y; };

function gitDate(file) {
  try { return execSync('git log -1 --format=%cI -- "' + file + '"', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().slice(0, 10) || null; }
  catch (e) { return null; }
}

function head(title) {
  return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<meta name="robots" content="noindex, nofollow">\n<meta name="referrer" content="same-origin">\n<title>' + esc(title) + '</title>\n' +
    '<link rel="icon" type="image/svg+xml" href="/assets/mp-mark.svg">\n<link rel="stylesheet" href="/assets/fonts.css">\n<link rel="stylesheet" href="/assets/entregables.css">\n</head>\n';
}
const brand = '<a class="ent-brand" href="/" target="_top"><img src="/assets/mp-mark.svg" alt=""><span>Martha Patricia Ortiz<small>Data · Analytics · Strategy</small></span></a>';

function cleanGenerated(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, MARK))) fs.rmSync(p, { recursive: true, force: true });
  }
  const idx = path.join(dir, 'index.html');
  if (fs.existsSync(idx) && fs.readFileSync(idx, 'utf8').includes('data-mp-generado')) fs.rmSync(idx);
}

function buildClient(folder) {
  const dir = path.join(base, folder);
  cleanGenerated(dir);
  let info = {};
  try { info = JSON.parse(fs.readFileSync(path.join(dir, '_cliente.json'), 'utf8')); } catch (e) {}
  const cliente = info.nombre || pretty(folder.replace(/-[a-z0-9]{3,6}$/i, ''));
  const home = '/entregables/' + encodeURIComponent(folder) + '/';
  const used = new Set();
  const docs = fs.readdirSync(dir).filter(f => OK.test(f) && f.toLowerCase() !== 'index.html' && !f.startsWith('.') && !f.startsWith('_')).map(file => {
    const ext = path.extname(file).toLowerCase();
    let stem = path.basename(file, path.extname(file));
    let date = null;
    const m = stem.match(/^(\d{4}-\d{2}-\d{2})[_ -]+(.+)$/);
    if (m) { date = m[1]; stem = m[2]; }
    let title = pretty(stem);
    if (ext !== '.pdf') {
      const t = fs.readFileSync(path.join(dir, file), 'utf8').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (t && t[1].trim()) title = decode(t[1].trim()).replace(/\s+/g, ' ');
    }
    let slug = slugify(stem), n = 2;
    while (used.has(slug) || fs.existsSync(path.join(dir, slug)) && !fs.existsSync(path.join(dir, slug, MARK))) slug = slugify(stem) + '-' + n++;
    used.add(slug);
    return { file, ext, title, slug, date: date || gitDate(path.join('entregables', folder, file)) };
  }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title, 'es'));

  // Una página por entregable: tu barra arriba + el archivo debajo.
  for (const d of docs) {
    const out = path.join(dir, d.slug);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, MARK), '');
    const raw = home + encodeURIComponent(d.file);
    const html = head(d.title + ' · ' + cliente) + '<body>\n<header class="ent-bar is-viewer">' + brand + '<span class="ent-sep"></span>' +
      '<div class="ent-doc"><b>' + esc(d.title) + '</b><span>Preparado para ' + esc(cliente) + (d.date ? ' · ' + fecha(d.date) : '') + '</span></div>' +
      '<nav class="ent-actions"><a class="ent-btn ent-hide-sm" href="' + home + '">← Todos</a>' +
      '<a class="ent-btn ent-hide-sm" href="' + raw + '" target="_blank" rel="noopener">Pantalla completa</a>' +
      '<a class="ent-btn primary" href="' + raw + '" download>Descargar</a></nav></header>\n' +
      '<iframe class="ent-frame" src="' + raw + '" title="' + esc(d.title) + '"></iframe>\n</body>\n</html>\n';
    fs.writeFileSync(path.join(out, 'index.html'), html);
  }

  // Portal del cliente con todos sus entregables.
  const cards = docs.map(d => '<article class="ent-card"><div class="ent-ico' + (d.ext === '.pdf' ? ' pdf' : '') + '">' + (d.ext === '.pdf' ? 'PDF' : 'WEB') + '</div>' +
    '<div class="ent-meta"><h2>' + esc(d.title) + '</h2><p>' + (d.ext === '.pdf' ? 'Documento PDF' : 'Documento interactivo') + (d.date ? ' · ' + fecha(d.date) : '') + '</p></div>' +
    '<div class="ent-actions"><a class="ent-btn primary" href="' + home + d.slug + '/">Abrir</a><a class="ent-btn" href="' + home + encodeURIComponent(d.file) + '" download>Descargar</a></div></article>').join('\n');
  const portal = head('Entregables · ' + cliente) + '<body data-mp-generado>\n<header class="ent-bar">' + brand + '</header>\n<main class="ent-wrap">\n' +
    '<p class="ent-eyebrow">Espacio de proyecto · ' + esc(cliente) + '</p>\n<h1 class="ent-h1">Entregables para <em>' + esc(cliente) + '</em></h1>\n' +
    '<p class="ent-lead">' + esc(info.mensaje || 'Aquí encuentras los documentos, tableros y análisis de nuestro proyecto. Puedes abrirlos en línea o descargarlos.') + '</p>\n' +
    (docs.length ? '<section class="ent-list">\n' + cards + '\n</section>' : '<p class="ent-empty">Pronto verás aquí los primeros entregables.</p>') + '\n' +
    '<aside class="ent-help"><div><b>¿Dudas sobre algún entregable?</b><p>Escríbeme y lo revisamos juntos.</p></div><a class="ent-btn primary" href="' + WA + '" target="_blank" rel="noopener">Escríbeme por WhatsApp</a></aside>\n</main>\n' +
    '<footer class="ent-foot"><span>© ' + new Date().getFullYear() + ' Martha Patricia Ortiz</span><span>Documento confidencial · solo para ' + esc(cliente) + '</span></footer>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(dir, 'index.html'), portal);
  return docs.length;
}

if (!fs.existsSync(base)) { console.log('entregables: sin carpeta'); process.exit(0); }
let total = 0, clientes = 0;
for (const name of fs.readdirSync(base)) {
  if (name.startsWith('.') || name.startsWith('_')) continue;
  if (!fs.statSync(path.join(base, name)).isDirectory()) continue;
  total += buildClient(name); clientes++;
}
console.log('entregables:', clientes, 'cliente(s),', total, 'archivo(s)');
