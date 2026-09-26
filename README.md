# datastudio.es

Sitio web de **Data Studio**, soluciones de datos desde Santa Cruz de la Sierra, Bolivia: Portal BI, Social Metrics BI, tiendas e-commerce y consultoría de datos.

- Hecho con [Astro](https://astro.build) 7 (salida estática) y publicado en GitHub Pages con GitHub Actions.
- Documentación completa en [`docs/`](docs/README.md).

## Empezar

```bash
# Requiere Node ≥ 22.12 (ver .nvmrc)
npm ci
npm run dev        # desarrollo
npm run build      # compilar a dist/
npm run preview    # servir el build (con la CSP activa)
npm run qa         # QA visual y técnico en 6 anchos (con preview corriendo)
```

Cada push a `main` se publica en https://datastudio.es.
