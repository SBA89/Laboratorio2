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

const EPS = 1e-9; // tolerancia para comparar decimales (0.1 + 0.2 no es exactamente 0.3 en un computador)

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

  // Ya escrito: recibe el almacén (no sabe cuál es), carga lo guardado y calcula el próximo id.
  constructor(almacen) {
    this.#almacen = almacen;
    this.#evaluaciones = almacen.cargar();
    this.#siguienteId = this.#evaluaciones.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  }

  // Ya escrito: devuelve COPIAS, para que nadie cambie el estado interno saltándose las reglas.
  get evaluaciones() {
    return this.#evaluaciones.map((e) => ({ ...e }));
  }

  // ---------------------------------------------------------------- 2A · Agregar y validar
  // ---------------------------------------------------------------- 2A · Agregar y validar
  // ---------------------------------------------------------------- 2A · Agregar y validar
  // ---------------------------------------------------------------- 2A · Agregar y validar
  // ---------------------------------------------------------------- 2A · Agregar y validar
  agregar({ nombre, peso, nota } = {}) {
    // 1. Limpiar espacios en blanco del nombre
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

    // 2. Validar nombre
    if (!nombreLimpio) {
      throw new ErrorDeReglas("El nombre es obligatorio.");
    }
    if (nombreLimpio.length > MAX_NOMBRE) {
      throw new ErrorDeReglas("El nombre no puede superar 40 caracteres.");
    }

    // 3. Validar peso
    const pesoNum = Number(peso);
    if (peso === undefined || peso === null || isNaN(pesoNum) || pesoNum < 1 || pesoNum > 100) {
      throw new ErrorDeReglas("El peso debe estar entre 1 y 100.");
    }

    // 4. Validar nota
    let notaValida = null;
    if (nota !== null && nota !== undefined && nota !== '') {
      notaValida = Number(nota);
      if (isNaN(notaValida) || notaValida < 0 || notaValida > 5) {
        throw new ErrorDeReglas("La nota debe estar entre 0 y 5.");
      }
    }

    // 5. Validar suma total de pesos
    const pesoActualTotal = this.#evaluaciones.reduce((sum, e) => sum + e.peso, 0);
    const disponible = 100 - pesoActualTotal;
    if (pesoNum > disponible) {
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${disponible} %).`);
    }

    // 6. Crear objeto y guardar
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
  resumen() {
    // TODO 2C: devuelve { acumulado, pesoCalificado, pesoPendiente, notaNecesaria, estado }.
    //          Usa NOTA_MINIMA, NOTA_MAXIMA, UMBRAL_RIESGO, EPS y redondearArriba (ya están arriba).
    throw new Error('TODO 2C · resumen()');
  }

  // ---------------------------------------------------------------- 2D · Observer y persistencia
  suscribir(suscriptor) {
    // TODO 2D: guarda el suscriptor y devuelve una función que lo cancele.
    throw new Error('TODO 2D · suscribir()');
  }

  #cambio() {
    // TODO 2D: después de CADA cambio: guarda en el almacén (this.#almacen.guardar(...)) y avisa a los suscriptores.
  }

  // Puedes agregar aquí los métodos privados que necesites (por ejemplo #buscar(id) o #validarNota(nota)).
}
