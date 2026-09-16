MARTHA PATRICIA — SITIO + DECAP CMS

QUÉ QUEDA ADMINISTRABLE
- /sobre-mi/#en-movimiento
- Fotos, título, tipo/categoría, lugar, año, descripción y link opcional.
- Texto de cabecera de la sección en ES/EN.
- Las imágenes se guardan en /uploads.

IMPORTANTE
Decap CMS necesita un repositorio Git. Este sitio actualmente fue desplegado con Netlify Drop.
Antes de usar /admin debes conectar el proyecto de Netlify a GitHub.

PASOS
1. En Netlify: Project configuration > Build & deploy > Continuous deployment > Repository.
2. Usa “Push to new repository” para crear un repo GitHub desde este proyecto (o conecta uno existente).
3. En admin/config.yml cambia:
     repo: REPO_OWNER/REPO_NAME
   por tu ruta real, por ejemplo:
     repo: marthaortiz/martha-patricia-site
4. En GitHub crea una OAuth App:
   - Homepage URL: https://marthapatriciaortiz.com
   - Authorization callback URL: https://api.netlify.com/auth/done
5. En Netlify: Project configuration > Access & security > OAuth > Install Provider > GitHub.
   Pega Client ID y Client Secret de la OAuth App.
6. Visita https://marthapatriciaortiz.com/admin/ y entra con tu cuenta de GitHub.

FLUJO DE EDICIÓN
- En /admin abre “En movimiento”.
- Sube la foto, escribe los campos y guarda/publica.
- Decap hará un commit al repo.
- Netlify detectará el commit y redeployará automáticamente.

NOTA
Git Gateway no se usa en esta configuración porque Netlify lo marcó como deprecated para nuevas configuraciones en 2026. Se usa el backend GitHub directo con OAuth de Netlify.


RESEÑAS / TESTIMONIOS
--------------------
- Los clientes envían su reseña desde /resenas/ usando Netlify Forms.
- Nada se publica automáticamente. Revisa las respuestas en Netlify > Forms.
- Para publicar una reseña aprobada: entra a /admin/ > Reseñas aprobadas > Testimonios del sitio, agrega el testimonio y publica.
- El correo del cliente es solo para validación y no forma parte del contenido público.
