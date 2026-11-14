// Clave opcional para /entregables/<cliente>/
// Se activa solo para los clientes listados en la variable de entorno de Netlify
// ENTREGABLES_CLAVES = {"emotiva-7k2q": "clave"}. Sin la variable, no hace nada.
export const config = { path: "/entregables/*" };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function token(slug, key) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mp-entregables:" + slug + ":" + key));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function page(slug, error) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Acceso privado · Martha Patricia Ortiz</title>
<link rel="icon" type="image/svg+xml" href="/assets/mp-mark.svg"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/entregables.css"></head>
<body><header class="ent-bar"><a class="ent-brand" href="/"><img src="/assets/mp-mark.svg" alt=""><span>Martha Patricia Ortiz<small>Data · Analytics · Strategy</small></span></a></header>
<main class="ent-lock"><form method="post"><p class="ent-eyebrow">Espacio privado</p><h1>Escribe tu clave de acceso</h1>
<p>Estos entregables son confidenciales. Usa la clave que te compartí junto con el enlace.</p>
<label for="clave">Clave</label><input id="clave" name="clave" type="password" autocomplete="current-password" required autofocus>
${error ? '<p class="ent-err">Esa clave no coincide. Revísala o escríbeme.</p>' : ""}
<button class="ent-btn primary" type="submit">Ver mis entregables</button>
<p style="margin-top:16px;font-size:.8rem">¿No tienes la clave? <a href="https://wa.me/522221580381" target="_blank" rel="noopener">Pídela por WhatsApp</a></p>
</form></main></body></html>`;
  return new Response(html, { status: 401, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.split("/")[2] || "");
  if (!slug) return;
  let keys = {};
  try {
    const raw = (globalThis.Netlify && Netlify.env.get("ENTREGABLES_CLAVES")) || "";
    keys = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return; // variable mal escrita: no bloquea el sitio
  }
  const key = keys[slug];
  if (!key) return;

  const expected = await token(slug, key);
  const name = "mpent_" + slug.replace(/[^a-zA-Z0-9_-]/g, "");
  const cookies = Object.fromEntries((request.headers.get("cookie") || "").split(/;\s*/).filter(Boolean).map((c) => {
    const i = c.indexOf("=");
    return [c.slice(0, i), c.slice(i + 1)];
  }));
  if (cookies[name] === expected) return;

  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    if (form && String(form.get("clave") || "") === String(key)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: url.pathname,
          "cache-control": "no-store",
          "set-cookie": `${name}=${expected}; Path=/entregables/${encodeURIComponent(slug)}/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page(esc(slug), true);
  }
  return page(esc(slug), false);
};
