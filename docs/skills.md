# Skills (agentes de IA)

Regla del proyecto: **cada tarea se hace con la skill especializada que corresponde.** Las skills se instalaron a nivel de usuario (`~/.claude/skills`) el 25/09/2026, solo de fuentes con buena reputación (verificadas por estrellas y actividad en GitHub).

## Cuándo usar cada una

| Tarea | Skill | Fuente |
| --- | --- | --- |
| Diseñar una página o sección nueva | `frontend-design`, `hallmark` | Anthropic / incluida |
| Pulir, auditar o rediseñar interfaz | `impeccable` | incluida |
| Microinteracciones y estados | `microinteractions` | incluida |
| Textos que venden (titulares, CTAs, secciones) | `copywriting` | coreyhaines31/marketingskills (★51k) |
| Mejorar conversión de una página | `cro` | coreyhaines31/marketingskills |
| Psicología de marketing (anclaje, prueba social) | `marketing-psychology` | coreyhaines31/marketingskills |
| Estructura del sitio, menú, URLs | `site-architecture` | coreyhaines31/marketingskills |
| Auditoría SEO | `seo-audit`, `seo` | coreyhaines31 / addyosmani/web-quality-skills |
| Datos estructurados (JSON-LD) | `schema` | coreyhaines31/marketingskills |
| Rendimiento y Core Web Vitals | `performance`, `core-web-vitals`, `web-perf` | addyosmani (★2,8k) / cloudflare/skills (★2,9k) |
| Auditoría de calidad integral | `web-quality-audit`, `best-practices` | addyosmani/web-quality-skills |
| Accesibilidad | `accessibility`, `web-design-guidelines` | incluidas |
| Revisión de código | `code-review-and-quality`, `code-review` | incluidas |
| Seguridad | `security-review` | incluida |
| Animaciones complejas (si hicieran falta) | `gsap` | incluida |

Para Astro no hay una skill de buena reputación (la más instalada tenía 14 estrellas): usar la documentación oficial (docs.astro.build) y los tipos de `node_modules/astro/dist/types/public/config.d.ts`.

## Reinstalar en otra máquina

```bash
npx skills add coreyhaines31/marketingskills -g -y -a claude-code --copy \
  -s copywriting -s cro -s marketing-psychology -s seo-audit -s schema -s site-architecture
npx skills add addyosmani/web-quality-skills -g -y -a claude-code --copy \
  -s core-web-vitals -s performance -s seo -s best-practices -s web-quality-audit
npx skills add cloudflare/skills -g -y -a claude-code --copy -s web-perf
```

Revisar el contenido de cualquier skill nueva antes de usarla: corre con los permisos del agente.
