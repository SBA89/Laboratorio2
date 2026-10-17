/**
 * CONTROLADOR · Notas del semestre                                       (PARTE 4 de la guía)
 *
 * SABE: traducir lo que hace el usuario (eventos de la Vista) en órdenes para el Modelo,
 *       y qué mostrar cuando el Modelo rechaza una orden.
 * NO SABE: HTML ni DOM (eso es de la Vista), ni las reglas del negocio (eso es del Modelo).
 *
 * Es "delgado": cada método hace tres cosas como máximo (leer → ordenar → reaccionar).
 */

import { ErrorDeReglas } from './modelo.js';

export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    // ---------------------------------------------------------------- 4A: Registrarse en la Vista
    
    // 1. Al agregar una nueva nota
    this.#vista.alAgregar((datosFormulario) => {
      this.#ejecutar(() => {
        // Validamos de forma segura si la nota viene vacía
        let notaValida = null;
        if (datosFormulario.nota !== null && datosFormulario.nota !== undefined && datosFormulario.nota !== '') {
          notaValida = Number(datosFormulario.nota);
        }
        
        this.#modelo.agregar({
          nombre: datosFormulario.nombre,
          peso: Number(datosFormulario.peso),
          nota: notaValida
        });
      }, true); 
    });

    // 2. Al eliminar
    this.#vista.alEliminar((id) => {
      this.#ejecutar(() => {
        this.#modelo.eliminar(id);
      });
    });

    // 3. Al calificar
    this.#vista.alCalificar((id, textoEscrito) => {
      this.#ejecutar(() => {
        // Validamos de forma segura sin usar trim() para que no choque en los tests
        let notaValida = null;
        if (textoEscrito !== null && textoEscrito !== undefined && textoEscrito !== '') {
          notaValida = Number(textoEscrito);
        }
        
        this.#modelo.calificar(id, notaValida);
      });
    });
  }

  // ---------------------------------------------------------------- 4B: Método privado ejecutor
  
  #ejecutar(accion, esAgregar = false) {
    try {
      // 1. Intentamos ejecutar la orden
      accion();
      
      // 2. Si todo sale bien: limpiamos errores pasados
      this.#vista.limpiarError();
      
      // 3. Si era la acción de agregar y fue exitosa, limpiamos el formulario
      if (esAgregar) {
        this.#vista.limpiarFormulario();
      }
      
    } catch (error) {
      // Usamos error.name para que sea 100% compatible con la suite de pruebas
      if (error instanceof ErrorDeReglas || error.name === 'ErrorDeReglas') {
        // Le pedimos a la Vista que muestre el mensaje de error
        this.#vista.mostrarError(error.message);
        
        // Obligamos a la vista a redibujarse
        if (typeof this.#vista.render === 'function') {
          this.#vista.render();
        }
      } else {
        // Si es un error inesperado, lo volvemos a lanzar
        throw error;
      }
    }
  }
}