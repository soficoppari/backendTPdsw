import { Router } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Calificacion } from '../Calificacion/calificacion.entity.js';
import {
  sanitizeVeterinarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  actualizarPromedio,
} from './veterinario.controller.js';

const em = ORM.em;

export const veterinarioRouter = Router();

veterinarioRouter.get('/', findAll);
veterinarioRouter.get('/:id', findOne);
veterinarioRouter.post('/', sanitizeVeterinarioInput, add);
veterinarioRouter.put('/:id', sanitizeVeterinarioInput, update);
veterinarioRouter.patch('/:id', sanitizeVeterinarioInput, update);
veterinarioRouter.delete('/:id', sanitizeVeterinarioInput, remove);

// Nueva ruta para obtener las calificaciones de un veterinario
veterinarioRouter.get('/:id/calificaciones', async (req, res) => {
  const { id } = req.params;

  try {
    const veterinarioId = Number(id);
    // Obtener las calificaciones del veterinario
    const calificaciones = await em.find(Calificacion, {
      veterinario: veterinarioId,
    });

    // Calcular el promedio de las calificaciones
    const promedio =
      calificaciones.length > 0
        ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) /
          calificaciones.length
        : null;

    res.status(200).json({ calificaciones, promedio });
  } catch (error) {
    console.error('Error al obtener las calificaciones:', error);
    res.status(500).json({ message: 'Error al obtener las calificaciones.' });
  }
});

// Ruta para actualizar el promedio del veterinario
veterinarioRouter.post('/:id/promedio', async (req, res) => {
  const { id } = req.params;

  try {
    const veterinarioId = Number(id);
    // Llamar a la función para actualizar el promedio
    await actualizarPromedio(veterinarioId);
    res.status(200).json({ message: 'Promedio actualizado con éxito.' });
  } catch (error) {
    console.error('Error al actualizar el promedio:', error);
    res.status(500).json({ message: 'Error al actualizar el promedio.' });
  }
});
