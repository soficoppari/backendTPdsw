import { Router } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Calificacion } from '../Calificacion/calificacion.entity.js';
import { Veterinario } from './veterinario.entity.js';
import {
  sanitizeVeterinarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  actualizarPromedio,
  horariosDisponibles,
} from './veterinario.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';
const em = ORM.em;

export const veterinarioRouter = Router();

veterinarioRouter.get('/check-matricula/:matricula', async (req, res) => {
  try {
    const matricula = Number(req.params.matricula);
    const existing = await em.findOne(Veterinario, { matricula });
    res.status(200).json({ disponible: !existing });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

veterinarioRouter.get('/', findAll);

// Verificar disponibilidad de matrícula — debe ir ANTES de /:id
veterinarioRouter.get('/check-matricula/:matricula', async (req, res) => {
  try {
    const matricula = Number(req.params.matricula);
    if (isNaN(matricula) || matricula <= 0) {
      return res.status(400).json({ disponible: false, message: 'Matrícula inválida' });
    }
    const existente = await em.findOne(Veterinario, { matricula });
    res.status(200).json({ disponible: !existente });
  } catch (error: any) {
    res.status(500).json({ disponible: false, message: error.message });
  }
});

veterinarioRouter.get('/:id', findOne);
veterinarioRouter.post('/', sanitizeVeterinarioInput, add);
veterinarioRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeVeterinarioInput,
  update
);
veterinarioRouter.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeVeterinarioInput,
  update
);
veterinarioRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeVeterinarioInput,
  remove
);

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
veterinarioRouter.post('/:id/promedio', authenticateToken, async (req, res) => {
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

// Nueva ruta para obtener los horarios disponibles de un veterinario en una fecha
veterinarioRouter.get('/:id/horarios-disponibles', horariosDisponibles);
