# Documentación del sitio de Data Studio

Memoria viva del proyecto **datastudio.es**. Se lee antes de trabajar y se actualiza después de cada cambio.

## Reglas obligatorias del proyecto

1. **Documentar todo en `/docs`**: decisiones, errores, aprendizajes, seguridad y rendimiento. Si algo salió mal, va a [aprendizajes.md](aprendizajes.md) para no repetirlo.
2. **Usar skills especializadas** en cada paso (diseño, copy, SEO, rendimiento, accesibilidad, seguridad). Lista y cuándo usar cada una: [skills.md](skills.md).
3. **Push al repo después de cada cambio.** `main` se publica sola en datastudio.es (ver [despliegue.md](despliegue.md)). Antes del push: `npm run build` + QA.

## Índice

| Documento | Para qué sirve |
| --- | --- |
| [arquitectura.md](arquitectura.md) | Stack, estructura de carpetas, páginas, componentes y rutas que no se pueden romper |
| [marca.md](marca.md) | Colores, contrastes, tipografías, logo, íconos, tono de voz y motivos visuales |
| [contenido.md](contenido.md) | Qué vende Data Studio, datos confirmados, fuentes y pendientes de confirmar |
| [seguridad.md](seguridad.md) | CSP, HTTPS, cadena de suministro, cumplimiento con Google/YouTube, TikTok y Meta |
| [performance.md](performance.md) | Presupuesto de peso, resultados de Lighthouse y cómo medir |
| [seo.md](seo.md) | Metadatos, datos estructurados, sitemap, Search Console |
| [accesibilidad.md](accesibilidad.md) | Prácticas WCAG 2.2 AA aplicadas y cómo verificarlas |
| [despliegue.md](despliegue.md) | Cómo se publica, entorno local, dominio y cómo volver atrás |
| [decisiones.md](decisiones.md) | Registro de decisiones de arquitectura (ADR) con su porqué |
| [aprendizajes.md](aprendizajes.md) | Errores encontrados, causa y solución. Leer antes de tocar código |
| [skills.md](skills.md) | Skills instaladas y cuándo usar cada una |
| [changelog.md](changelog.md) | Bitácora de cambios por fecha |

## Flujo de trabajo en 6 pasos

1. Leer este índice, [aprendizajes.md](aprendizajes.md) y el documento del área a tocar.
2. Cargar la skill que corresponde (ver [skills.md](skills.md)).
3. Cambiar el código. Los datos de negocio van en `src/data/sitio.ts`, nunca sueltos en componentes.
4. Verificar: `npm run build`, `npm run preview` y `npm run qa` (capturas 320–1440 px, desbordes, errores, CSP).
5. Actualizar la documentación afectada y el [changelog.md](changelog.md).
6. Commit en español, descriptivo, y `git push` a `main`.
