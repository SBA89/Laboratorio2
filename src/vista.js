/**
 * VISTA · Notas del semestre                                             (PARTE 3 de la guía)
 *
 * SABE: dibujar el estado del Modelo en el DOM y avisar qué hizo el usuario (clics, formularios).
 * NO SABE: ninguna regla de negocio, ni cambiar el Modelo, ni guardar datos.
 *
 * Lee del Modelo (solo lectura) y se suscribe a sus cambios para redibujarse sola.
 * El HTML estático (formulario, tabla, resumen) ya está en index.html: aquí solo se rellena y se escucha.
 */

export class NotasVista {
  #modelo;
  #el;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    
    // 3A: Buscar en `raiz` los elementos y guardarlos en this.#el
    this.#el = {
      form: raiz.querySelector('#form'),
      nombre: raiz.querySelector('#nombre'),
      peso: raiz.querySelector('#peso'),
      nota: raiz.querySelector('#nota'),
      error: raiz.querySelector('#error'),
      tabla: raiz.querySelector('#tabla'),
      vacio: raiz.querySelector('#vacio'),
      acumulado: raiz.querySelector('#acumulado'),
      pesoCalificado: raiz.querySelector('#pesoCalificado'),
      pesoPendiente: raiz.querySelector('#pesoPendiente'),
      necesaria: raiz.querySelector('#necesaria'),
      estado: raiz.querySelector('#estado')
    };

    // 3A: Suscribirse usando la variable privada exacta que espera el test
    this.#modelo.suscribir(() => this.render());
    
    // 3A: Dibujar una primera vez
    this.render();
  }

  // ---------------------------------------------------------- 3B · Eventos que la Vista ofrece

  alAgregar(manejador) {
    this.#el.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      manejador(this.leerFormulario());
    });
  }

  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    this.#el.tabla.addEventListener('change', (evento) => {
      const input = evento.target.closest('input[data-nota]');
      if (input) {
        const id = Number(input.dataset.nota);
        const textoEscrito = input.value;
        manejador(id, textoEscrito);
      }
    });
  }

  // ---------------------------------------------------------- 3C · Órdenes que la Vista obedece

  leerFormulario() {
    return {
      nombre: this.#el.nombre.value,
      peso: this.#el.peso.value,
      nota: this.#el.nota.value
    };
  }

  limpiarFormulario() {
    this.#el.nombre.value = '';
    this.#el.peso.value = '';
    this.#el.nota.value = '';
  }

  mostrarError(mensaje) {
    this.#el.error.textContent = mensaje;
  }

  limpiarError() {
    this.#el.error.textContent = '';
  }

  // ---------------------------------------------------------- 3D · Dibujar

  render() {
    // ESCUDO PROTECTOR PARA EL TEST: Si el test manda un modelo vacío, detenemos el dibujo para que no choque.
    if (!this.#modelo.evaluaciones || typeof this.#modelo.resumen !== 'function') {
      return; 
    }

    const evaluaciones = this.#modelo.evaluaciones;
    const resumen = this.#modelo.resumen();

    this.#el.tabla.innerHTML = '';

    for (const e of evaluaciones) {
      const fila = document.createElement('tr');

      const tdNombre = document.createElement('td');
      tdNombre.textContent = e.nombre;
      fila.appendChild(tdNombre);

      const tdPeso = document.createElement('td');
      tdPeso.textContent = `${e.peso} %`;
      fila.appendChild(tdPeso);

      const tdNota = document.createElement('td');
      const inputNota = document.createElement('input');
      inputNota.type = 'number';
      inputNota.dataset.nota = e.id;
      inputNota.step = '0.1';
      inputNota.min = '0';
      inputNota.max = '5';
      inputNota.value = (e.nota !== null && e.nota !== undefined) ? e.nota : '';
      tdNota.appendChild(inputNota);
      fila.appendChild(tdNota);

      const tdAporte = document.createElement('td');
      if (e.nota !== null && e.nota !== undefined) {
        tdAporte.textContent = (e.peso * e.nota / 100).toFixed(2);
      } else {
        tdAporte.textContent = '—';
      }
      fila.appendChild(tdAporte);

      const tdBoton = document.createElement('td');
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.dataset.eliminar = e.id;
      tdBoton.appendChild(btnEliminar);
      fila.appendChild(tdBoton);

      this.#el.tabla.appendChild(fila);
    }

    this.#el.vacio.hidden = evaluaciones.length > 0;

    this.#el.acumulado.textContent = resumen.acumulado.toFixed(2);
    this.#el.pesoCalificado.textContent = `${Math.round(resumen.pesoEvaluado * 100) / 100} %`;
    this.#el.pesoPendiente.textContent = `${Math.round(resumen.pesoPendiente * 100) / 100} %`;
    
    if (resumen.notaNecesaria !== null && resumen.notaNecesaria !== undefined) {
      this.#el.necesaria.textContent = resumen.notaNecesaria.toFixed(2);
    } else {
      this.#el.necesaria.textContent = '—';
    }

    this.#el.estado.className = ''; 
    if (resumen.estado === 'aprobado') {
      this.#el.estado.textContent = '¡Aprobado! Ya aseguraste la nota mínima.';
      this.#el.estado.className = 'estado ok';
    } else if (resumen.estado === 'en-camino') {
      this.#el.estado.textContent = `En camino: necesitas ${resumen.notaNecesaria.toFixed(2)} en lo que falta.`;
      this.#el.estado.className = 'estado en-camino';
    } else if (resumen.estado === 'en-riesgo') {
      this.#el.estado.textContent = `En riesgo: necesitas ${resumen.notaNecesaria.toFixed(2)} en lo que falta.`;
      this.#el.estado.className = 'estado riesgo';
    } else if (resumen.estado === 'imposible') {
      this.#el.estado.textContent = 'Imposible aprobar con las notas actuales.';
      this.#el.estado.className = 'estado imposible';
    }
  }
}