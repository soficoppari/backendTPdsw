import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Horario } from './horario.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';

const em = ORM.em;

function sanitizeHorarioInput(req: Request, res: Response, next: NextFunction) {
  const { dia, horaInicio, horaFin, veterinarioId } = req.body;

  // Validación preliminar

  req.body.sanitizedInput = {
    dia,
    horaInicio,
    horaFin,
    veterinarioId,
  };
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const horarios = await em.find(Horario, {});
    res.status(200).json({ message: 'found all horarios', data: horarios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horario = await em.findOneOrFail(Horario, { id });
    res.status(200).json({ message: 'found horario', data: horario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const { dia, horaInicio, horaFin, veterinarioId } = req.body.sanitizedInput;

    console.log('Datos del horario:', {
      dia,
      horaInicio,
      horaFin,
      veterinarioId,
    });

    // Formatear `horaInicio` y `horaFin` para almacenar solo la hora en formato HH:mm
    const formattedHoraInicio = new Date(horaInicio)
      .toISOString()
      .slice(11, 16);
    const formattedHoraFin = new Date(horaFin).toISOString().slice(11, 16);

    // Buscar el veterinario
    const veterinario = await em.findOneOrFail(Veterinario, {
      id: veterinarioId,
    });

    // Crear y persistir el horario con las horas formateadas
    const horario = em.create(Horario, {
      dia,
      horaInicio: formattedHoraInicio,
      horaFin: formattedHoraFin,
      veterinario,
    });
    await em.persistAndFlush(horario);

    res.status(201).json({ message: 'Horario creado', data: horario });
  } catch (error: any) {
    console.error('Error al crear el horario:', error);
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horarioToUpdate = await em.findOneOrFail(Horario, { id });
    em.assign(horarioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'horario updated', data: horarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horario = em.getReference(Horario, id);
    await em.removeAndFlush(horario);
    res.status(200).json({ message: 'horario deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeHorarioInput, findAll, findOne, add, update, remove };
