import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Turno } from './turno.entity.js';

const em = ORM.em;

function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    horarios: req.body.horarios,
    estado: req.body.estado,
    usuarioId: req.body.usuarioId,
    mascotaId: req.body.mascotaId,
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
    const turnos = await em.find(Turno, {});
    res.status(200).json({ message: 'found all turnos', data: turnos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turno = await em.findOneOrFail(Turno, { id });
    res.status(200).json({ message: 'found turno', data: turno });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const turno = em.create(Turno, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'turno created', data: turno });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turnoToUpdate = await em.findOneOrFail(Turno, { id });
    em.assign(turnoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'horario updated', data: turnoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turno = em.getReference(Turno, id);
    await em.removeAndFlush(turno);
    res.status(200).json({ message: 'turno deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeTurnoInput, findAll, findOne, add, update, remove };
