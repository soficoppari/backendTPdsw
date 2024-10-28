import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Especie } from './especie.entity.js';

const em = ORM.em;

function sanitizeEspecieInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    mascotas: req.body.mascotas,
    veterinarios: req.body.veterinarios,
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
    const especies = await em.find(Especie, {});
    res.status(200).json({ message: 'found all especies', data: especies });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const especie = await em.findOneOrFail(Especie, { id });
    res.status(200).json({ message: 'found especie', data: especie });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const especie = em.create(Especie, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'especie created', data: especie });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const especieToUpdate = await em.findOneOrFail(Especie, { id });
    em.assign(especieToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'especie updated', data: especieToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const especie = em.getReference(Especie, id);
    await em.removeAndFlush(especie);
    res.status(200).json({ message: 'especie deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeEspecieInput, findAll, findOne, add, update, remove };
