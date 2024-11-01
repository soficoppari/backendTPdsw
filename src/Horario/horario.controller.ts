import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Horario } from './horario.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';

const em = ORM.em;

function sanitizeHorarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    dia: req.body.dia,
    horaInicio: req.body.horaInicio,
    horaFin: req.body.horaFin,
    veterinarioId: req.body.veterinarioId,
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

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

    console.log('Datos recibidos:', {
      dia,
      horaInicio,
      horaFin,
      veterinarioId,
    });

    //Busca el veterinario
    const veterinario = await em.findOneOrFail(Veterinario, {
      id: veterinarioId,
    });

    const horario = em.create(Horario, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'horario created', data: horario });
  } catch (error: any) {
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
