import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Calificacion } from './calificacion.entity.js';
import { Turno } from '../Turno/turno.entity.js';
import { EstadoTurno } from '../Turno/turno.enum.js';

const em = ORM.em;

function sanitizeCalificacionInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    veterinarioId,
    usuarioId,
    turnoId,
    puntuacion,
    comentario,
    visible,
    verificada,
  } = req.body;

  // Validar campos requeridos
  if (!veterinarioId || !usuarioId || !turnoId || !puntuacion) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  // Validar rango de puntuación
  if (puntuacion < 1 || puntuacion > 5) {
    return res
      .status(400)
      .json({ message: 'La puntuación debe estar entre 1 y 5.' });
  }

  // Sanitizar y normalizar entrada
  req.body.sanitizedInput = {
    veterinarioId: parseInt(veterinarioId, 10),
    usuarioId: parseInt(usuarioId, 10),
    turnoId: parseInt(turnoId, 10),
    puntuacion: parseFloat(puntuacion),
    comentario: comentario?.trim(),
    fecha: req.body.fecha || new Date(),
    visible: visible !== undefined ? Boolean(visible) : true,
    verificada: verificada !== undefined ? Boolean(verificada) : false,
  };

  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const { veterinarioId, usuarioId, page = 1, limit = 10 } = req.query;

    // Construir filtros dinámicos
    const filters: any = {};
    if (veterinarioId) filters.veterinario = veterinarioId;
    if (usuarioId) filters.usuario = usuarioId;

    // Consultar con filtros y paginación
    const [calificaciones, total] = await em.findAndCount(
      Calificacion,
      filters,
      {
        limit: parseInt(limit as string, 10),
        offset:
          (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
      }
    );

    res.status(200).json({
      message: 'Calificaciones encontradas',
      data: calificaciones,
      total,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const calificacion = await em.findOneOrFail(Calificacion, { id });
    res.status(200).json({ message: 'found calificacion', data: calificacion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const { veterinarioId, usuarioId, turnoId, puntuacion, comentario } =
      req.body.sanitizedInput;

    // **1. Verificar que el turno existe y está completado**
    const turno = await em.findOne(Turno, { id: turnoId });
    if (!turno || turno.estado !== EstadoTurno.COMPLETADO) {
      return res.status(400).json({
        message: 'El turno debe estar completado para dejar una reseña.',
      });
    }

    // **2. Verificar que el turno no tenga ya una reseña asociada**
    const existente = await em.findOne(Calificacion, { turno: turnoId });
    if (existente) {
      return res
        .status(400)
        .json({ message: 'Ya existe una reseña para este turno.' });
    }

    // **3. Verificar que el veterinario existe**
    const veterinario = await em.findOne(Veterinario, { id: veterinarioId });
    if (!veterinario) {
      return res.status(404).json({ message: 'Veterinario no encontrado.' });
    }

    // Crear la nueva calificación
    const nuevaCalificacion = em.create(Calificacion, {
      veterinario,
      usuario: usuarioId,
      turno,
      puntuacion,
      comentario,
      fecha: new Date(),
      visible: true, // Asumido como valor por defecto
      verificada: true, // Asumido como valor por defecto
    });

    // **4. Persistir la calificación y asociarla al turno**
    await em.persistAndFlush(nuevaCalificacion);

    // **5. Actualizar la relación del turno con la calificación**
    turno.calificacion = nuevaCalificacion; // Asocia la calificación al turno
    await em.persistAndFlush(turno); // Guardar el turno con la calificación asociada

    res
      .status(201)
      .json({ message: 'Reseña creada con éxito.', data: nuevaCalificacion });
  } catch (error: any) {
    console.error('Error al agregar la calificación:', error);
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeCalificacionInput, findAll, findOne, add };
