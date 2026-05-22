# CUT — Confederación Unitaria de Trabajadores
## Guía de despliegue · GitHub Pages + Blogger · v2.1

---

## 📦 ARCHIVOS QUE RECIBE EN ESTA ENTREGA

Estos son los únicos archivos que existen actualmente. No hay ningún otro:

```
cut-web/
│
├── .nojekyll                         ✅ Incluido — necesario para GitHub Pages
├── 404.html                          ✅ Incluido — página de error personalizada
├── index.html                        ✅ Incluido — página principal completa
├── cut-blogger-theme.xml             ✅ Incluido — tema XML para Blogger
├── robots.txt                        ✅ Incluido — SEO (actualizar URL)
├── sitemap.xml                       ✅ Incluido — mapa del sitio (actualizar URL)
├── README.md                         ✅ Incluido — esta guía
│
├── pages/
│   ├── quienes-somos.html            ✅ Incluido
│   ├── noticias.html                 ✅ Incluido
│   ├── sindicatos.html               ✅ Incluido
│   ├── documentos.html               ✅ Incluido
│   ├── junta-directiva.html          ✅ Incluido
│   ├── contacto.html                 ✅ Incluido
│   └── afiliacion.html               ✅ Incluido
│
└── assets/
    ├── css/
    │   ├── styles.css                ✅ Incluido
    │   └── blogger.css               ✅ Incluido
    ├── js/
    │   └── main.js                   ✅ Incluido
    └── images/
        └── logo-cut.png              ✅ Incluido — logo oficial CUT
```

**Total: 19 archivos entregados. Nada más, nada menos.**

---

## 📤 ARCHIVOS QUE USTED DEBE AGREGAR (no existen aún)

Estos archivos NO vienen en la entrega. Usted los debe crear o conseguir
y subirlos a GitHub en las rutas exactas indicadas:

```
assets/
└── images/
    ├── hero-bg.jpg                   ← USTED SUBE: foto fondo del hero
    │                                    Tamaño: 1920×1080 px, JPG, máx 400 KB
    │                                    Contenido: trabajadores, marcha sindical
    │
    ├── og-image.jpg                  ← USTED SUBE: imagen para redes sociales
    │                                    Tamaño: 1200×630 px, JPG
    │                                    Aparece al compartir en WhatsApp/Facebook
    │
    └── sindicatos/                   ← USTED CREA esta carpeta en GitHub
        ├── sittraiproa-logo.png      ← Logo de SITTRAIPROA (200×200, PNG)
        ├── suntracs-logo.png         ← Logo de SUNTRACS   (200×200, PNG)
        ├── sitrama-logo.png          ← Logo de SITRAMA    (200×200, PNG)
        ├── unttrasa-logo.png         ← Logo de UNTTRASA   (200×200, PNG)
        ├── sintradepp-logo.png       ← Logo de SINTRADEPP (200×200, PNG)
        ├── asomem-logo.png           ← Logo de ASOMEM     (200×200, PNG)
        └── hacienda-logo.png         ← Logo Seccional Hacienda (200×200, PNG)
```

### ¿Qué pasa si no sube estos archivos?

| Archivo faltante | Efecto en el sitio |
|---|---|
| `hero-bg.jpg` | El hero muestra fondo oscuro (se ve bien igual) |
| `og-image.jpg` | Sin imagen al compartir en redes (no rompe el sitio) |
| Logos de sindicatos | Las tarjetas muestran las siglas en texto (funciona igual) |

**El sitio funciona perfectamente sin estos archivos.** Los puede agregar después.

---

## 📄 DOCUMENTOS QUE DEBE SUBIR (PDFs para descargar)

Los documentos institucionales tampoco vienen en la entrega.
Usted debe crear la carpeta `assets/docs/` en GitHub y subir cada archivo:

```
assets/
└── docs/                             ← USTED CREA esta carpeta en GitHub
    ├── estatuto-cut.pdf              ← Estatuto de la CUT
    ├── mision-vision-principios.pdf  ← Misión, Visión y Principios
    ├── primera-junta-directiva.pdf   ← Primera Junta Directiva
    ├── resena-historica-cut.pdf      ← Reseña Histórica
    ├── aprendiendo-a-negociar.pdf    ← Aprendiendo a Negociar
    ├── formulario-web-cut.pdf        ← Formulario Web Institucional
    └── portada-estatuto-cut.pdf      ← Portada del Estatuto
```

Luego en `pages/documentos.html`, actualice el `href` de cada botón:
```html
<!-- Antes (placeholder): -->
<a href="#" class="doc-btn-primary">⬇ Descargar PDF</a>

<!-- Después (URL real): -->
<a href="https://TU-USUARIO.github.io/cut-web/assets/docs/estatuto-cut.pdf"
   class="doc-btn-primary">⬇ Descargar PDF</a>
```

---

## ⚙️ CAMBIOS OBLIGATORIOS ANTES DE PUBLICAR

### 1. Reemplazar TU-USUARIO (en 3 archivos)

Abra cada archivo con el Bloc de notas. Use Ctrl+H (Buscar y reemplazar):

| Archivo | Buscar | Reemplazar con |
|---------|--------|----------------|
| `cut-blogger-theme.xml` | `TU-USUARIO` | su usuario de GitHub |
| `robots.txt` | `TU-USUARIO` | su usuario de GitHub |
| `sitemap.xml` | `TU-USUARIO` | su usuario de GitHub |

Ejemplo: si su usuario de GitHub es `cut-costarica`, reemplace
`TU-USUARIO` por `cut-costarica` en los 3 archivos.

### 2. Actualizar redes sociales (en index.html, todos los archivos pages/ y el XML)

Busque y reemplace en cada archivo:
```
https://facebook.com/CUT.CostaRica  →  URL real de Facebook de la CUT
https://x.com/CUT_CR                →  URL real de Twitter/X de la CUT
https://youtube.com/@CUT_CR         →  URL real de YouTube de la CUT
https://instagram.com/cut_cr        →  URL real de Instagram de la CUT
```

### 3. Actualizar datos de contacto (en index.html y pages/contacto.html)

```
+506 2222-0000       →  Teléfono real de la CUT
info@cut.or.cr       →  Correo electrónico real
San José, Costa Rica →  Dirección exacta de la sede
```

### 4. Activar el hero-bg.jpg (en assets/css/styles.css)

Cuando tenga la foto lista y subida, abra `styles.css` y dentro de
`.hero-bg { }` agregue estas dos líneas:
```css
background-image: url('../images/hero-bg.jpg');
background-size: cover;
background-position: center;
```

### 5. Activar los logos de sindicatos (en pages/sindicatos.html)

Para cada sindicato, busque el comentario en el HTML y reemplace:
```html
<!-- Cambia esto: -->
<div class="initials" aria-hidden="true">SIT<br>TRAI</div>

<!-- Por esto (con la ruta real): -->
<img src="../assets/images/sindicatos/sittraiproa-logo.png"
     alt="Logo SITTRAIPROA">
```

### 6. Activar el mapa de Google (en pages/contacto.html)

1. Vaya a maps.google.com
2. Busque la dirección exacta de la CUT
3. Clic en "Compartir" → "Insertar un mapa" → copie el iframe
4. En contacto.html busque el comentario del mapa y pegue el iframe

---

## 🚀 PASOS PARA PUBLICAR EN GITHUB PAGES

**PASO 1 — Crear cuenta en GitHub**
1. Vaya a github.com → haga clic en "Sign up"
2. Elija un nombre de usuario (ejemplo: `cut-costarica`)
3. Confirme su correo electrónico

**PASO 2 — Crear el repositorio**
1. En GitHub clic en "New repository" (botón verde)
2. Nombre: `cut-web`
3. Marque: Public ✔
4. Clic en "Create repository"

**PASO 3 — Subir los 19 archivos entregados**
1. En el repositorio: clic en "Add file" → "Upload files"
2. Arrastre TODOS los archivos y carpetas
   (mantenga la misma estructura de carpetas)
3. Clic en "Commit changes"

**PASO 4 — Activar GitHub Pages**
1. En el repositorio → "Settings" → "Pages"
2. Source: "Deploy from a branch"
3. Branch: main → carpeta: / (root)
4. Clic en "Save"
5. Espere 2-3 minutos
6. Su sitio estará en: `https://cut-costarica.github.io/cut-web/`

---

## 📝 PASOS PARA CONFIGURAR BLOGGER

**PASO 5 — Crear el blog**
1. Vaya a blogger.com con cuenta Google
2. "Crear un blog" → Nombre: CUT Costa Rica
3. URL: `cut-costarica.blogspot.com`

**PASO 6 — Subir el tema XML**
1. Panel Blogger → "Tema" → ⋮ (tres puntos) → "Restaurar"
2. Seleccione `cut-blogger-theme.xml`
3. Confirme

**PASO 7 — Crear las 7 páginas estáticas**
En Blogger → "Páginas" → "Nueva página" (repita 7 veces):

| Título | Página |
|--------|--------|
| Quiénes somos | Copie el contenido de pages/quienes-somos.html |
| Noticias | Copie el contenido de pages/noticias.html |
| Sindicatos afiliados | Copie el contenido de pages/sindicatos.html |
| Documentos | Copie el contenido de pages/documentos.html |
| Junta Directiva | Copie el contenido de pages/junta-directiva.html |
| Contacto | Copie el contenido de pages/contacto.html |
| Afiliación | Copie el contenido de pages/afiliacion.html |

**PASO 8 — Publicar la primera noticia**
Blogger → "Entradas" → "Nueva entrada" → escriba el título y texto →
suba una foto → agregue etiqueta (ej: SINDICAL) → Publicar.

---

## 🔄 AÑOS — AUTOMÁTICO CADA 23 DE NOVIEMBRE

El número de años de la CUT se calcula automáticamente en main.js.
No necesita cambiar nada nunca. El 23 de noviembre de cada año suma 1 solo.

---

## ✅ CHECKLIST COMPLETO

Archivos base:
[ ] Subidos los 19 archivos a GitHub
[ ] Activado GitHub Pages (Settings → Pages → main)

Cambios obligatorios:
[ ] Reemplazado TU-USUARIO en cut-blogger-theme.xml, robots.txt y sitemap.xml
[ ] Actualizado el teléfono real de la CUT
[ ] Actualizado el correo electrónico real
[ ] Actualizada la dirección exacta de la sede
[ ] Actualizadas las 4 URLs de redes sociales en todos los archivos

Archivos que usted agrega (opcionales pero recomendados):
[ ] Subida hero-bg.jpg a assets/images/
[ ] Activada en styles.css la línea background-image
[ ] Subida og-image.jpg a assets/images/
[ ] Creada carpeta assets/docs/ con los PDFs institucionales
[ ] Actualizado href de botones de descarga en pages/documentos.html
[ ] Creada carpeta assets/images/sindicatos/ con los logos
[ ] Activados los logos en pages/sindicatos.html (reemplazar initials por img)
[ ] Activado el iframe de Google Maps en pages/contacto.html

Blogger:
[ ] Subido cut-blogger-theme.xml como tema
[ ] Creadas las 7 páginas estáticas en Blogger
[ ] Publicada la primera noticia de prueba con foto
[ ] Actualizadas las URLs de páginas en cut-blogger-theme.xml

Verificación final:
[ ] El logo CUT aparece en navbar, hero y footer
[ ] El panel de accesibilidad funciona (5 opciones)
[ ] Los años se calculan correctamente
[ ] El sitio se ve bien en móvil
[ ] El sitio se ve bien en Chrome y Firefox

---

## 📄 DOCUMENTOS FUENTE INTEGRADOS

Toda la información real de estos documentos está integrada en las páginas:

| Documento original | Dónde aparece en el sitio |
|---|---|
| Primera_Junta_Directiva_de_la_CUT.docx | pages/junta-directiva.html — 12 miembros completos + 5 suplentes |
| Misiòn__visiòn__principios_.docx | index.html y pages/quienes-somos.html — 8 principios completos |
| Portada_estatuto_CUT_.docx | Fecha fundación (23 nov 1980) en hero, footer y timeline |
| CUT_APRENDIENDO_A_NEGOCIAR_.docx | pages/documentos.html — descarga; mencionado en noticias |
| reseña_histórica_y_actual_de_la_CUT_.pdf | pages/quienes-somos.html (historia); pages/sindicatos.html (OIT, FSM, convenciones); pages/contacto.html (representación institucional) |
| CUT_Formulario_Web_Institucional__1_.docx | Arquitectura, secciones y funcionalidades implementadas |

---

*CUT — Confederación Unitaria de Trabajadores*
*Costa Rica · Fundada el 23 de noviembre de 1980 · Siempre con el Pueblo*
