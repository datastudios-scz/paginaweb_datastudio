/**
 * Aparición al hacer scroll: cada `[data-revelar]` entra una vez al llegar a la vista.
 * Respaldo: si el observador no existe o nunca dispara, a los 1,5 s se revela todo.
 * Una animación nunca puede ser la razón por la que alguien no lee la página.
 */
const bloques = Array.from(document.querySelectorAll<HTMLElement>('[data-revelar]'));
const revelar = (el: HTMLElement) => el.classList.add('es-visible');

if (bloques.length) {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (quieto || !('IntersectionObserver' in window)) {
    bloques.forEach(revelar);
  } else {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            revelar(entrada.target as HTMLElement);
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    bloques.forEach((b) => observador.observe(b));

    // Solo revela lo que ya pasó de largo si el observador falló; lo que está más abajo sigue esperando.
    setTimeout(() => {
      for (const b of bloques) {
        if (b.getBoundingClientRect().top < innerHeight) revelar(b);
      }
    }, 1500);
  }
}
