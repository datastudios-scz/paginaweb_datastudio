/**
 * El recorrido animado del Portal BI (/portal-bi/como-funciona/): lo que vive una persona de
 * tu equipo, del ingreso al chat con IA.
 *
 * Ocho pasos que mueven un cursor y una "cámara" sobre la pantalla del portal, dibujada a
 * tamaño real (RecorridoPantalla.astro). El reloj, la cámara, el cursor, la narración y los
 * controles son del motor (recorrido-motor.ts), que comparte con el recorrido del
 * administrador; acá vive solo el guion.
 *
 * En un teléfono el chat se angosta un poco para que entre legible (clase es-angosta).
 */
import { iniciarRecorrido, type Region } from './recorrido-motor';

iniciarRecorrido({
  duraciones: [7500, 8050, 8100, 9000, 6300, 10500, 7300, 8250],

  /* La descarga vive en la barra de la ventana, fuera de la pantalla */
  alRedibujar: ({ $ }) => $('descarga').classList.remove('es-visible', 'es-lista'),

  guion: ({ P, $, p, TODO, ANCHO, ALTO, tel, instante, esperar, camara, region, union, moverCursor, irA, clic, pasar, escribir, contar, escena }) => {
    /** El panel del chat por su lugar en el layout (mientras entra, su caja todavía está corrida). */
    const regionChat = (): Region => {
      const w = p('chat').offsetWidth;
      return { x: ANCHO - w, y: 0, w, h: ALTO };
    };

    const bajarHilo = () => {
      const hilo = p('hilo');
      hilo.scrollTo({ top: hilo.scrollHeight, behavior: instante() ? 'instant' : 'smooth' });
    };

    return [
      /* 1 · Ingresa con su usuario */
      async () => {
        escena('ingreso', 'portal.tuempresa.com');
        camara(TODO, 1, 0);
        await esperar(1300);
        camara(p('login'), 1.35, 1400);
        await irA(p('usuario'), 0.25, 0.55);
        await clic();
        p('usuario').classList.add('es-foco');
        await escribir(p('usuario-txt'), 'mariana.s', 95);
        await irA(p('clave'), 0.25, 0.55);
        await clic();
        p('usuario').classList.remove('es-foco');
        p('clave').classList.add('es-foco');
        await escribir(p('clave-txt'), 'xxxxxxxxxx', 70, true);
        await irA(p('ingresar'), 0.5, 0.55);
        pasar(p('ingresar'));
        await esperar(200);
        await clic(p('ingresar'));
        p('clave').classList.remove('es-foco');
        p('ingresar').classList.add('es-enviando');
        await esperar(1300);
      },

      /* 2 · Encuentra lo suyo en el menú */
      async () => {
        escena('portal', 'portal.tuempresa.com/home');
        camara(p('bienvenida'), 1, 900);
        await esperar(1500);
        const menu = p('menu-tableros');
        camara({ x: 0, y: 60, w: 420, h: 380 }, 1.3, 1200);
        await irA(menu, 0.45);
        pasar(menu);
        await esperar(250);
        await clic(menu);
        pasar(menu, false);
        menu.classList.add('es-abierto');
        p('menu-sub').classList.add('es-abierto');
        await esperar(750);
        const comercial = p('menu-comercial');
        await irA(comercial, 0.4);
        pasar(comercial);
        await esperar(200);
        await clic(comercial);
        pasar(comercial, false);
        comercial.classList.add('es-activo');
        p('migas').textContent = 'Comercial';
        $('url').textContent = 'portal.tuempresa.com/tableros?empresa=Comercial';
        p('bienvenida').classList.add('es-fuera');
        p('tarjetas').classList.add('es-visible');
        const tarjetas = p('tarjetas').children;
        /* En un teléfono entran dos tarjetas: las de la izquierda, donde está la que se abre. */
        camara(tel() ? union(tarjetas[0], tarjetas[1]) : p('tarjetas'), 1.15, 1300);
        await esperar(1100);
        if (!tel()) {
          await irA(tarjetas[2], 0.5, 0.55);
          pasar(tarjetas[2]);
          await esperar(500);
          pasar(tarjetas[2], false);
        }
        await irA(tarjetas[1], 0.5, 0.55);
        pasar(tarjetas[1]);
        await esperar(tel() ? 700 : 450);
        pasar(tarjetas[1], false);
      },

      /* 3 · Abre el tablero con IA */
      async () => {
        const tarjeta = p('tarjeta-ventas');
        await irA(tarjeta, 0.5, 0.55);
        pasar(tarjeta);
        await esperar(650);
        await clic(tarjeta);
        escena('visor', 'portal.tuempresa.com/tableros/visor?nombre=Ventas%20por%20sucursal');
        camara(TODO, 1, 900);
        await moverCursor(1020, 600);
        await esperar(1300);
        p('capa').classList.add('es-oculta');
        p('pbi').classList.add('es-dibujado');
        /* Escritorio: el tablero entero. Teléfono: la mitad de las barras. */
        camara(p('vis-barras'), 1, 1000);
        await Promise.all([...p('pbi').querySelectorAll<HTMLElement>('[data-contar]')].map(contar));
        await esperar(2900);
      },

      /* 4 · Descarga los datos */
      async () => {
        const visual = p('vis-barras');
        camara(visual, 1.45, 1300);
        await irA(visual, 0.62, 0.55);
        pasar(visual);
        await esperar(500);
        const mas = p('vis-mas');
        await irA(mas);
        pasar(mas);
        await clic(mas);
        p('menu-pbi').classList.add('es-abierto');
        await esperar(550);
        const exportar = p('exportar');
        await irA(exportar, 0.3);
        pasar(exportar);
        await esperar(350);
        await clic(exportar);
        p('menu-pbi').classList.remove('es-abierto');
        pasar(mas, false);
        p('dialogo').classList.add('es-abierto');
        camara(p('dialogo-caja'), 1.5, 1100);
        await esperar(1200);
        const boton = p('dialogo-exportar');
        await irA(boton);
        pasar(boton);
        await esperar(200);
        await clic(boton);
        p('dialogo').classList.remove('es-abierto');
        pasar(visual, false);
        const descarga = $('descarga');
        descarga.classList.add('es-visible');
        camara(visual, 1, 1200);
        await esperar(1300);
        descarga.classList.add('es-lista');
        await esperar(1400);
      },

      /* 5 · Abre el chat al costado: el chip es el protagonista, la cámara va hasta él */
      async () => {
        const lengueta = p('lengueta');
        lengueta.classList.add('es-llamando');
        camara({ x: 980, y: 230, w: 300, h: 300 }, 2.4, 1300);
        await esperar(1600);
        await irA(lengueta, 0.5, 0.45);
        pasar(lengueta);
        await esperar(600);
        await clic(lengueta);
        lengueta.classList.remove('es-llamando');
        P.querySelector('.rc-visor')?.classList.add('es-chat');
        camara(regionChat, 1, 1200);
        await moverCursor(900, 470);
        await esperar(2400);
      },

      /* 6 · Pregunta */
      async () => {
        const campo = p('campo');
        /* La toma va a la izquierda del campo, donde aparece lo que se escribe: centrar el
           campo entero dejaba el texto afuera en un teléfono. */
        const r = region(campo);
        camara({ ...r, w: Math.min(r.w, 500) }, 2, 1200);
        await irA(campo, 0.3, 0.5);
        await clic();
        campo.classList.add('es-foco', 'es-escribiendo');
        const pregunta = '¿Cuáles fueron las 5 sucursales que más vendieron en septiembre?';
        await escribir(p('pregunta'), pregunta, 40);
        await irA(p('enviar'));
        await clic(p('enviar'));
        p('pregunta').textContent = '';
        campo.classList.remove('es-foco', 'es-escribiendo');
        p('yo-txt').textContent = pregunta;
        p('hola').classList.add('es-fuera');
        p('yo').classList.add('es-visible');
        p('bot').classList.add('es-visible');
        camara(p('hilo'), 1.3, 1100);
        await moverCursor(1180, 690);
        for (const [n, ms] of [[1, 700], [2, 1500], [3, 900]] as const) {
          const paso = p(`paso-${n}`);
          paso.classList.add('es-activo');
          await esperar(ms);
          paso.classList.replace('es-activo', 'es-ok');
        }
        await esperar(300);
      },

      /* 7 · Responde y muestra la consulta */
      async () => {
        const dax = p('dax');
        dax.classList.add('es-visible');
        void dax.offsetHeight;
        dax.classList.add('es-abierto');
        camara(dax, 1.35, 1100);
        await esperar(2300);
        p('tabla').classList.add('es-visible');
        bajarHilo();
        /* La cámara espera a que el hilo termine de bajar: si no, apunta a donde estaba la tabla. */
        await esperar(450);
        camara(p('tabla'), 1.4, 1100);
        await esperar(1500);
        p('analisis').classList.add('es-visible');
        p('acciones').classList.add('es-visible');
        bajarHilo();
        await esperar(450);
        camara(p('analisis'), 1.4, 1000);
        await esperar(2600);
      },

      /* 8 · Lo dibuja */
      async () => {
        const generar = p('generar');
        await irA(generar);
        pasar(generar);
        await esperar(300);
        await clic(generar);
        pasar(generar, false);
        p('grafico').classList.add('es-visible');
        bajarHilo();
        await esperar(500);
        camara(p('grafico'), 1.35, 1100);
        await esperar(2200);
        const copiar = p('copiar-imagen');
        await irA(copiar);
        pasar(copiar);
        await esperar(250);
        await clic(copiar);
        pasar(copiar, false);
        copiar.classList.add('es-copiado');
        p('copiar-txt').textContent = 'Imagen copiada';
        await esperar(1500);
        camara(regionChat, 1, 1400);
        await esperar(1700);
      },
    ];
  },
});
