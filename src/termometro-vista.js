import { NOTA_MINIMA, NOTA_MAXIMA } from './modelo.js';

export class TermometroVista {
  #raiz;
  #modelo;
  #relleno;
  #leyenda;

  constructor(raiz, modelo) {
    this.#raiz = raiz;
    this.#modelo = modelo;

    // 1. Crear la estructura: div.termometro > div.relleno + div.linea
    const termometro = document.createElement('div');
    termometro.className = 'termometro';

    this.#relleno = document.createElement('div');
    this.#relleno.className = 'relleno';

    const linea = document.createElement('div');
    linea.className = 'linea';
    
    // Ubicar la línea en el porcentaje exacto de la nota mínima
    linea.style.left = `${(NOTA_MINIMA / NOTA_MAXIMA) * 100}%`;

    // Armar el termómetro
    termometro.appendChild(this.#relleno);
    termometro.appendChild(linea);

    // Crear la leyenda
    this.#leyenda = document.createElement('p');
    this.#leyenda.className = 'leyenda';

    // Agregar todo al contenedor principal (la raíz que nos pasen)
    this.#raiz.appendChild(termometro);
    this.#raiz.appendChild(this.#leyenda);

    // 2. ¡La magia del Observer! Nos suscribimos para escuchar los cambios y pintamos la primera vez
    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  render() {
    // Pedirle al modelo el resumen actual
    const resumen = this.#modelo.resumen();
    const acumulado = resumen.acumulado;

    // Calcular el porcentaje de llenado (sin pasarse del 100%)
    let porcentaje = (acumulado / NOTA_MAXIMA) * 100;
    if (porcentaje > 100) porcentaje = 100;

    // Llenar la barrita
    this.#relleno.style.width = `${porcentaje}%`;

    // Actualizar el texto de la leyenda (ej. "3.25 de 5.0 · la línea marca el mínimo...")
    this.#leyenda.textContent = `${acumulado.toFixed(2)} de ${NOTA_MAXIMA.toFixed(1)} · la línea marca el mínimo para aprobar (${NOTA_MINIMA.toFixed(1)})`;
  }
}