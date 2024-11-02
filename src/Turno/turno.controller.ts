import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Turno } from './turno.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Horario } from '../Horario/horario.entity.js';

const em = ORM.em;

function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    estado: req.body.estado,
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
    const { mascotaId, veterinarioId } = req.body.sanitizedInput;

    // Validación de IDs requeridos
    if (!mascotaId || !veterinarioId) {
      return res.status(400).json({
        message: 'Faltan datos requeridos: mascotaId, veterinarioId ',
      });
    }

    // Verificar existencia de la mascota, veterinario y horario
    const mascota = await em.findOne(Mascota, { id: mascotaId });
    const veterinario = await em.findOne(Veterinario, { id: veterinarioId });

    if (!mascota || !veterinario) {
      return res.status(404).json({
        message: 'Mascota, Veterinario o Horario no encontrado',
      });
    }

    // Crear el turno
    const turno = em.create(Turno, {
      estado: true, // Asignar estado 'true' como disponible
      mascota,
      veterinario,
    });

    await em.flush();

    return res
      .status(201)
      .json({ message: 'Turno creado con éxito', data: turno });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
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
