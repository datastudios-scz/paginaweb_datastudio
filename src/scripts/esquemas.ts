/** Generadores de datos estructurados (schema.org / JSON-LD). */

const sinEtiquetas = (html: string) =>
  html
    .replace(/<\/p>\s*<p>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export function faqPage(preguntas: { pregunta: string; respuesta: string }[], url: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#preguntas`,
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: sinEtiquetas(p.respuesta) },
    })),
  };
}

export function migas(items: { nombre: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nombre,
      item: item.url,
    })),
  };
}
