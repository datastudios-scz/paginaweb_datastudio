/**
 * El recorrido del administrador (/portal-bi/como-funciona/administrador/): lo que hace quien
 * administra el portal, del alta de una persona a su tablero con IA, su vista, la marca y los
 * registros.
 *
 * Ocho pasos sobre el panel de administración dibujado a tamaño real (RecorridoAdmin.astro).
 * El reloj, la cámara, el cursor, la narración y los controles son del motor
 * (recorrido-motor.ts), el mismo del recorrido de tu equipo; acá vive solo el guion.
 *
 * Todo lo que cambia en la pantalla es una clase: al saltar de paso el motor la vuelve a
 * dibujar y corre el guion de golpe hasta ahí, así que cada paso tiene que dejarla en su
 * estado aunque no haya esperas (el scroll también: de golpe es 'instant').
 *
 * El encuadre: en escritorio, toda toma del área principal va con zoom ≥ 1,26 (1280 / 1018,
 * el ancho de la pantalla sobre el del área sin el menú). Con menos, la cámara pegada al borde
 * derecho se corre a la izquierda y el borde de la toma parte el menú por la mitad de sus
 * palabras. Las tomas del cuadro de asignar quedan con menos: lo que cortan está detrás del velo.
 *
 * El ritmo: la primera versión duraba 93 s (los pasos 2 a 4, de 14 a 16 s). Cada clic cuesta
 * el viaje del cursor más la pausa sobre el botón, así que se recortaron clics que no contaban
 * nada nuevo (el tipo de usuario queda el de siguiente) y las pausas largas.
 */
import { iniciarRecorrido } from './recorrido-motor';

iniciarRecorrido({
  duraciones: [6800, 9900, 12000, 10600, 9300, 7700, 8800, 7300],
  /* Una mano más rápida que la de tu equipo: en el panel el cursor viaja más (del menú a los
     botones de la derecha) y con el ritmo de aquel el recorrido duraba 78 s */
  cursor: { base: 330, porPixel: 0.38, tope: 880 },

  guion: ({ P, p, TODO, ANCHO, tel, instante, esperar, camara, region, union, moverCursor, irA, clic, pasar, escribir, contar, escena }) => {
    /** Pasa, espera un instante y hace clic: lo que hace una mano sobre un botón. */
    const tocar = async (el: Element, fx = 0.5, fy = 0.5, pausa = 110) => {
      await irA(el, fx, fy);
      pasar(el);
      await esperar(pausa);
      await clic(el);
      pasar(el, false);
    };

    /** Va a una sección: el cursor toca su módulo en el menú y la pantalla cambia. */
    const seccion = async (clave: string, url: string) => {
      await tocar(p(`item-${clave}`), 0.3);
      escena(clave, url);
    };

    /** Lleva lo que scrollea hasta que `el` quede arriba, con un margen. Mide en la pantalla
        (1280 × 760): la cámara la escala, así que se divide por la escala del momento. */
    const llevar = (caja: HTMLElement, el: Element, margen = 16) => {
      const escala = P.getBoundingClientRect().width / ANCHO;
      const top = (el.getBoundingClientRect().top - caja.getBoundingClientRect().top) / escala + caja.scrollTop - margen;
      caja.scrollTo({ top: Math.max(0, top), behavior: instante() ? 'instant' : 'smooth' });
    };

    /** Hace clic en un campo y escribe en él, con el cursor de texto mientras tanto. */
    const tipear = async (campo: HTMLElement, texto: HTMLElement, valor: string, cadencia: number, oculto = false) => {
      await irA(campo, 0.18, 0.5);
      await clic();
      campo.classList.add('es-foco');
      await escribir(texto, valor, cadencia, oculto);
      campo.classList.remove('es-foco');
    };

    /** Pega lo que guarda el campo en data-valor (el enlace, el JSON): no se tipea. */
    const pegar = (texto: HTMLElement) => {
      texto.textContent = texto.dataset.valor ?? '';
    };

    /** La toma de un elemento. En un teléfono la pantalla entera no se lee: la cámara se acerca
        más a lo que importa ahí (`enTel`, si no es el mismo) y, si es ancho, mira su parte
        izquierda, donde empieza lo que se lee. Una toma del cuadro entero no sirve en el
        teléfono: es alto, y la cámara no puede acercarse sin cortarlo. */
    const ver = (el: Element, zoom: number, ms: number, enTel: Element = el) => {
      if (!tel()) return camara(el, zoom, ms);
      camara(() => {
        const r = region(enTel);
        return { ...r, w: Math.min(r.w, 520) };
      }, Math.max(zoom, 1.6), ms);
    };

    return [
      /* 1 · Un panel para manejarlo todo */
      async () => {
        escena('tablero', 'portal.tuempresa.com/admin');
        camara(TODO, 1, 0);
        await esperar(500);
        await Promise.all([...p('stats').querySelectorAll<HTMLElement>('[data-contar]')].map(contar));
        await esperar(800);
        /* Los módulos: la cámara va al menú y el cursor lo recorre */
        camara(p('menu'), 1.25, 1300);
        await moverCursor(150, 150);
        for (const clave of ['usuarios', 'licencia', 'workspaces', 'registros', 'personalizacion']) {
          const item = p(`item-${clave}`);
          await irA(item, 0.32);
          pasar(item);
          await esperar(200);
          pasar(item, false);
        }
        camara(TODO, 1, 1100);
        await esperar(700);
      },

      /* 2 · Da de alta a una persona: con su usuario, o con su correo */
      async () => {
        await seccion('usuarios', 'portal.tuempresa.com/admin/credenciales');
        ver(p('lista-usuarios'), 1, 900, p('nuevo-usuario'));
        await esperar(400);
        await tocar(p('nuevo-usuario'));
        p('modal-usuario').classList.add('es-abierta');
        ver(p('mu-caja'), 1.3, 900, p('mu-acceso'));
        await esperar(250);
        await tipear(p('mu-usuario'), p('mu-usuario-txt'), 'carlos.r', 70);
        await tipear(p('mu-correo'), p('mu-correo-txt'), 'carlos.r@tuempresa.com', 16);
        await tipear(p('mu-clave'), p('mu-clave-txt'), 'xxxxxxxxxx', 30, true);
        await tocar(p('mu-crear'));
        p('modal-usuario').classList.remove('es-abierta');
        p('fila-nueva').classList.add('es-visible');
        p('usuarios-n').textContent = '1001 usuarios';
        p('grupo-n').textContent = '903';
        ver(p('fila-nueva'), 1.5, 1000);
        await moverCursor(760, 600);
        await esperar(1000);
      },

      /* 3 · Le arma su vista: el constructor recorre el modelo y arma el filtro */
      async () => {
        await seccion('workspaces', 'portal.tuempresa.com/admin/powerbi');
        const v = p('v-workspaces');
        camara(TODO, 1, 900);
        await esperar(350);
        const boton = p('ws-filtro');
        await tocar(boton);
        boton.classList.add('es-activa');
        p('sem').classList.add('es-abierta');
        await esperar(150);
        await tocar(p('sem-cargar'), 0.5, 0.5, 80);
        p('sem-cargar').classList.add('es-cargando');
        await esperar(350);
        p('sem').querySelector('.ra-sem')!.classList.add('es-cargado');
        llevar(v, p('sem'), 70);
        await esperar(400);
        ver(p('sem'), 1.3, 900);
        const tabla = p('chip-sucursales');
        await tocar(tabla, 0.5, 0.5, 100);
        tabla.classList.add('es-activo');
        p('paso-2').classList.add('es-visible');
        await esperar(200);
        const columna = p('chip-sucursal');
        await tocar(columna, 0.5, 0.5, 100);
        columna.classList.add('es-activo');
        p('paso-3').classList.add('es-visible');
        llevar(v, p('paso-2'), 40);
        await esperar(400);
        ver(p('paso-3'), 1.35, 900, p('val-norte'));
        const norte = p('val-norte');
        await tocar(norte, 0.12, 0.5, 100);
        norte.classList.add('es-marcada');
        await esperar(200);
        await tocar(p('agregar'));
        p('json').classList.add('es-visible');
        llevar(v, p('json'), 60);
        await esperar(400);
        ver(p('json'), 1.35, 900);
        await esperar(300);
        /* En el teléfono el botón de copiar queda a la derecha, fuera de la toma */
        if (tel()) camara(p('copiar-json'), 1.6, 600);
        await tocar(p('copiar-json'));
        p('copiar-json').classList.add('es-copiado');
        p('copiar-json-txt').textContent = 'Copiado';
        await esperar(900);
      },

      /* 4 · Le asigna su tablero: para quién, qué reporte y el enlace leído en palabras */
      async () => {
        await seccion('licencia', 'portal.tuempresa.com/admin/licencia');
        camara(TODO, 1, 900);
        await esperar(350);
        await tocar(p('asignar'));
        p('modal-asignar').classList.add('es-abierta');
        ver(p('ma-caja'), 1.2, 900, p('ma-para'));
        await esperar(200);
        const picker = p('ma-usuario');
        await tocar(picker, 0.4, 0.5, 100);
        picker.classList.add('es-abierto');
        p('ma-picker').classList.add('es-abierta');
        await esperar(250);
        await tocar(p('mp-carlos'), 0.3, 0.5, 100);
        picker.classList.remove('es-abierto');
        picker.classList.add('es-elegido');
        p('ma-picker').classList.remove('es-abierta');
        await tipear(p('ma-empresa'), p('ma-empresa-txt'), 'Comercial', 40);
        if (tel()) ver(p('ma-caja'), 1.2, 700, p('ma-nombre'));
        await tipear(p('ma-nombre'), p('ma-nombre-txt'), 'Ventas por sucursal', 24);
        /* El enlace no se tipea: se pega, y el panel lo lee en palabras */
        await irA(p('ma-enlace'), 0.18, 0.5);
        await clic();
        pegar(p('ma-enlace-txt'));
        await esperar(300);
        p('ma-lectura').classList.add('es-visible');
        ver(p('ma-lectura'), 1.7, 900);
        await esperar(1300);
      },

      /* 5 · Y decide cómo lo ve: su vista y las opciones del tablero */
      async () => {
        const cuerpo = p('ma-cuerpo');
        llevar(cuerpo, p('ma-filtros-btn'), 50);
        ver(p('ma-caja'), 1.2, 800, p('ma-filtros-btn'));
        await esperar(400);
        const filtros = p('ma-filtros-btn');
        await tocar(filtros, 0.3);
        filtros.classList.add('es-abierto');
        p('ma-filtros').classList.add('es-abierto');
        await esperar(200);
        /* El JSON que copió del constructor, pegado */
        const caja = p('ma-filtros-caja');
        await irA(caja, 0.3, 0.5);
        await clic();
        caja.classList.add('es-foco');
        pegar(p('ma-filtros-txt'));
        await esperar(400);
        caja.classList.remove('es-foco');
        ver(caja, 1.6, 800);
        await esperar(700);
        /* Las opciones: plegadas, se abren */
        const opciones = p('ma-opciones');
        const cab = p('ma-opciones-cab');
        ver(p('ma-caja'), 1.2, 700, cab);
        await tocar(cab, 0.4);
        opciones.classList.add('es-abierto');
        await esperar(200);
        llevar(cuerpo, p('ma-paginas'), 40);
        await esperar(400);
        ver(p('ma-paginas'), 1.6, 800);
        const costos = p('pag-costos');
        await tocar(costos, 0.1, 0.5, 100);
        costos.classList.add('es-marcada');
        opciones.classList.add('es-con-activas');
        p('ma-cuenta').textContent = '1';
        p('ma-resumen').textContent = 'Activas: 1 página oculta.';
        await esperar(300);
        const exportar = p('ma-sin-exportar');
        llevar(cuerpo, exportar, 130);
        await esperar(400);
        ver(exportar, 1.6, 800);
        await tocar(exportar, 0.03, 0.25, 100);
        exportar.classList.add('es-marcada');
        p('ma-cuenta').textContent = '2';
        p('ma-resumen').textContent = 'Activas: sin «Exportar datos» y 1 página oculta.';
        await esperar(350);
        /* El resumen de la cabecera dice cuáles hay, sin abrir el bloque */
        llevar(cuerpo, opciones, 12);
        await esperar(400);
        ver(cab, 1.7, 900);
        await esperar(1300);
      },

      /* 6 · El chat con IA, tablero por tablero, y dónde se abre */
      async () => {
        const cuerpo = p('ma-cuerpo');
        const chat = p('ma-chat');
        llevar(cuerpo, chat, 40);
        ver(p('ma-caja'), 1.2, 800, chat);
        await esperar(400);
        await tocar(chat, 0.04, 0.32);
        chat.classList.add('es-marcada');
        p('ma-aviso').classList.add('es-visible');
        p('ma-modo').classList.add('es-visible');
        await esperar(200);
        ver(p('ma-aviso'), 1.6, 900);
        await esperar(1900);
        const lateral = p('ma-lateral');
        llevar(cuerpo, p('ma-modo'), 20);
        await esperar(400);
        ver(p('ma-modo'), 1.5, 800);
        await tocar(lateral, 0.05, 0.3);
        p('ma-pestana').classList.remove('ra-radio--on');
        lateral.classList.add('ra-radio--on');
        await esperar(350);
        ver(p('ma-caja'), 1.1, 800, p('ma-asignar'));
        await tocar(p('ma-asignar'));
        p('modal-asignar').classList.remove('es-abierta');
        p('grupo-nuevo').classList.add('es-visible');
        p('asig-n').textContent = '2416 resultados';
        ver(p('grupo-nuevo'), 1.35, 1000);
        await moverCursor(900, 330);
        await esperar(1300);
      },

      /* 7 · Su marca, con la vista previa al lado */
      async () => {
        await seccion('personalizacion', 'portal.tuempresa.com/admin/configuracion');
        const v = p('v-personalizacion');
        camara(TODO, 1, 900);
        await esperar(350);
        const titulo = p('cfg-titulo');
        /* En el teléfono no entran el campo y la vista previa juntos: se va de uno a la otra */
        if (tel()) ver(titulo, 1.6, 900);
        else camara(union(titulo, p('previa')), 1.3, 1000);
        await irA(titulo, 0.5, 0.5);
        await clic();
        titulo.classList.add('es-foco', 'es-seleccion');
        await esperar(300);
        titulo.classList.remove('es-seleccion');
        /* La vista previa cambia mientras se escribe, como en el panel */
        await Promise.all([
          escribir(p('cfg-titulo-txt'), 'ACME Analytics', 60),
          escribir(p('previa-marca'), 'ACME Analytics', 60),
        ]);
        titulo.classList.remove('es-foco');
        if (tel()) ver(p('previa'), 1.4, 800);
        const color = p('cfg-color');
        if (tel()) ver(color, 1.6, 800);
        await irA(color, 0.4, 0.5);
        await clic();
        color.classList.add('es-foco', 'es-seleccion');
        await esperar(300);
        color.classList.remove('es-seleccion');
        await escribir(p('cfg-color-txt'), '#1d6b47', 80);
        v.classList.add('es-acme');
        color.classList.remove('es-foco');
        if (tel()) ver(p('previa'), 1.4, 800);
        await esperar(700);
        if (tel()) ver(p('guardar'), 1.6, 800);
        else camara(TODO, 1, 900);
        await tocar(p('guardar'));
        p('guardado').classList.add('es-visible');
        /* 1,3: con menos, el borde de la toma partía el menú por la mitad de sus palabras */
        if (tel()) ver(p('guardado'), 1.6, 900);
        else camara(union(p('guardado'), p('previa')), 1.3, 900);
        await esperar(1200);
      },

      /* 8 · Y sabe quién entra y qué abre */
      async () => {
        await seccion('registros', 'portal.tuempresa.com/admin/registros?periodo=mes');
        if (tel()) ver(p('kpis'), 1.6, 900);
        else camara(TODO, 1, 900);
        await esperar(250);
        p('v-registros').classList.add('es-dibujado');
        p('tendencia').classList.add('es-dibujada');
        await Promise.all([...p('kpis').querySelectorAll<HTMLElement>('[data-contar]')].map(contar));
        await esperar(500);
        ver(p('tendencia'), 1.3, 1100);
        await esperar(1500);
        ver(p('mas-vistos'), 1.3, 1100);
        await esperar(1700);
        camara(TODO, 1, 1200);
        await esperar(900);
      },
    ];
  },
});
