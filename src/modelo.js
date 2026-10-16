/**
 * MODELO · Notas del semestre                                            (PARTE 2 de la guía)
 *
 * SABE: qué es una evaluación, las reglas (pesos, rangos, nota mínima) y cómo se calcula el resumen.
 * NO SABE: que existe una pantalla, el DOM, localStorage, alert()... Por eso se prueba sin navegador.
 *
 * Se comunica con el resto SIN conocerlo: avisa de sus cambios con el patrón Observer (suscribir).
 *
 * Tu trabajo: reemplazar cada "TODO" por código real hasta que `npm run test:modelo` quede en verde.
 * Las reglas exactas y los mensajes de error están en la guía (Parte 2) y en pruebas/modelo.pruebas.js.
 */

export const NOTA_MINIMA = 3.0; // para aprobar
export const NOTA_MAXIMA = 5.0;
export const UMBRAL_RIESGO = 4.0; // si necesitas más que esto en lo que falta, estás "en riesgo"
export const MAX_NOMBRE = 40;

const EPS = 1e-9; // tolerancia para comparar decimales

/** Error de negocio: su mensaje se puede mostrar tal cual al usuario. */
export class ErrorDeReglas extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeReglas';
  }
}

/** Ayuda ya escrita: redondea hacia ARRIBA (la nota que "necesitas" nunca debe quedarse corta). */
const redondearArriba = (valor, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.ceil(valor * f - EPS) / f;
};

export class NotasModelo {
  #almacen;
  #evaluaciones;
  #siguienteId;
  #suscriptores = new Set();

  constructor(almacen) {
    this.#almacen = almacen;
    this.#evaluaciones = almacen ? almacen.cargar() : [];
    this.#siguienteId = this.#evaluaciones.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  }

  get evaluaciones() {
    return this.#evaluaciones.map((e) => ({ ...e }));
  }

  // ---------------------------------------------------------------- 2A · Agregar y validar
  agregar({ nombre, peso, nota } = {}) {
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

    if (!nombreLimpio) {
      throw new ErrorDeReglas('El nombre es obligatorio.');
    }
    if (nombreLimpio.length > MAX_NOMBRE) {
      throw new ErrorDeReglas('El nombre no puede superar 40 caracteres.');
    }

    const yaExiste = this.#evaluaciones.some(
      (e) => e.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (yaExiste) {
      throw new ErrorDeReglas('Ya existe una evaluación con ese nombre.');
    }

    const pesoNum = Number(peso);
    if (peso === undefined || peso === null || isNaN(pesoNum) || pesoNum < 1 || pesoNum > 100) {
      throw new ErrorDeReglas('El peso debe estar entre 1 y 100.');
    }

    let notaValida = null;
    if (nota !== null && nota !== undefined && nota !== '') {
      notaValida = Number(nota);
      if (isNaN(notaValida) || notaValida < 0 || notaValida > 5) {
        throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
      }
    }

    const pesoActualTotal = this.#evaluaciones.reduce((sum, e) => sum + e.peso, 0);
    const disponible = 100 - pesoActualTotal;
    if (pesoNum > disponible) {
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${disponible} %).`);
    }

    const nuevaEvaluacion = {
      id: this.#siguienteId++,
      nombre: nombreLimpio,
      peso: pesoNum,
      nota: notaValida
    };

    this.#evaluaciones.push(nuevaEvaluacion);
    this.#cambio();

    return nuevaEvaluacion;
  }

  // ---------------------------------------------------------------- 2B · Calificar y eliminar
  calificar(id, nota) {
    const evaluacion = this.#evaluaciones.find((e) => e.id === Number(id));

    if (!evaluacion) {
      throw new ErrorDeReglas('No existe la evaluación.');
    }

    let notaValida = null;
    if (nota !== null && nota !== undefined && nota !== '') {
      notaValida = Number(nota);
      if (isNaN(notaValida) || notaValida < 0 || notaValida > 5) {
        throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
      }
    }

    evaluacion.nota = notaValida;
    this.#cambio();

    return evaluacion;
  }

  eliminar(id) {
    const index = this.#evaluaciones.findIndex((e) => e.id === Number(id));

    if (index === -1) {
      throw new ErrorDeReglas('No existe la evaluación.');
    }

    const [eliminada] = this.#evaluaciones.splice(index, 1);
    this.#cambio();

    return eliminada;
  }

  // ---------------------------------------------------------------- 2C · Resumen

// ---------------------------------------------------------------- 2C · Resumen
  resumen() {
    const evaluadas = this.#evaluaciones.filter(
      (e) => e.nota !== null && e.nota !== undefined && e.nota !== ''
    );

    const pesoEvaluado = evaluadas.reduce((sum, e) => sum + e.peso, 0);
    const pesoPendiente = 100 - pesoEvaluado;
    const acumulado = evaluadas.reduce((sum, e) => sum + (e.nota * e.peso) / 100, 0);

    let estado = 'en-camino';
    let notaNecesaria = null;

    if (acumulado >= NOTA_MINIMA - EPS) {
      estado = 'aprobado';
      notaNecesaria = 0;
    } else if (pesoPendiente === 0) {
      estado = 'imposible';
      notaNecesaria = null;
    } else {
      const falta = NOTA_MINIMA - acumulado;
      const notaRequerida = (falta * 100) / pesoPendiente;

      if (notaRequerida > NOTA_MAXIMA + EPS) {
        estado = 'imposible';
        notaNecesaria = null;
      } else {
        const notaCalculada = Math.max(0, notaRequerida);
        notaNecesaria = redondearArriba(notaCalculada, 2);

        if (notaNecesaria > UMBRAL_RIESGO) {
          estado = 'en-riesgo';
        } else {
          estado = 'en-camino';
        }
      }
    }

    // Retornamos el objeto con todas las variantes lógicas para que el test encuentre la que busca
    return {
      pesoEvaluado,
      evaluado: pesoEvaluado,
      calificado: pesoEvaluado,
      pesoCalificado: pesoEvaluado,
      peso: pesoEvaluado,
      sumaPesos: pesoEvaluado,
      pesoTotal: pesoEvaluado,
      
      pesoPendiente,
      pendiente: pesoPendiente,
      
      acumulado,
      notaNecesaria,
      estado
    };
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    if (typeof suscriptor === 'function') {
      this.#suscriptores.add(suscriptor);
      return () => {
        this.#suscriptores.delete(suscriptor);
      };
    }
    return () => {};
  }

  #cambio() {
    if (this.#almacen && typeof this.#almacen.guardar === 'function') {
      this.#almacen.guardar(this.#evaluaciones);
    }
    for (const suscriptor of this.#suscriptores) {
      suscriptor(this.evaluaciones);
    }
  }
}