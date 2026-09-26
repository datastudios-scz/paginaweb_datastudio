# Sitio web de Data Studio (datastudio.es)

Astro 7 estático, publicado en GitHub Pages desde `main` con GitHub Actions. Español con tuteo.

## Reglas obligatorias (del dueño del proyecto)

1. **Documentar en `/docs`**. Antes de trabajar, leer `docs/README.md` y `docs/aprendizajes.md`. Después de cada cambio, actualizar lo que corresponda (aprendizajes, decisiones, seguridad, performance, changelog).
2. **Usar skills especializadas** para cada tarea (tabla en `docs/skills.md`): diseño, copy, SEO, rendimiento, accesibilidad, seguridad.
3. **Push al repo después de cada cambio** (`main` se publica sola). Antes: `npm run build`, `npm run preview` + `npm run qa`.

## No romper nunca

- `public/privacidad/`, `public/terminos/`, `public/oauth/tiktok/`, `public/google5af846498ca551c6.html`, `public/CNAME`: registrados en Google/YouTube, TikTok y Meta. Cambiarlos puede tumbar verificaciones de apps.
- El home debe seguir describiendo las integraciones con redes sociales y enlazando la Política de Privacidad.

## Convenciones

- Datos de negocio (contacto, WhatsApp, navegación, precio de licencia) solo en `src/data/sitio.ts`.
- Colores, tipografías y espaciado solo desde `src/styles/tokens.css`. Cada sección declara `data-tema`.
- CSP estricta: **sin atributos `style="…"`**, sin `define:vars`, sin scripts/estilos externos.
- Para estilizar el SVG de `<Icono>`/`<Logo>` desde otro componente: `.contenedor :global(svg)`.
- No inventar testimonios, clientes ni cifras (ver `docs/contenido.md`).
- Node ≥ 22.12. En Git Bash: `export PATH="/c/Users/Dell/AppData/Local/nvm/v24.21.0:$PATH"` (no cambiar el Node global).
- Commits en español, descriptivos. Nunca `push --force` a `main`.
