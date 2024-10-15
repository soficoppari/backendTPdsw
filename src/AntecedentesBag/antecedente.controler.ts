import { Request, Response, NextFunction } from 'express';
import { Antecedente } from './antecedente.entity.js';
import { ORM } from '../shared/db/orm.js';

const em = ORM.em;

function sanitizeAntecedenteInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id: req.body.id,
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    nombreMotivo: req.body.nombreMotivo,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const antecedentes = await em.find(Antecedente, {});
    res
      .status(200)
      .json({ message: 'found all antecedentes', data: antecedentes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const antecedente = await em.findOneOrFail(Antecedente, { id });
    res.status(200).json({ message: 'found antecedente', data: antecedente });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const antecedente = em.create(Antecedente, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'antecedente created', data: antecedente });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const antecedenteToUpdate = await em.findOneOrFail(Antecedente, { id });
    em.assign(antecedenteToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'antecedente updated', data: antecedenteToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const antecedente = em.getReference(Antecedente, id);
    await em.removeAndFlush(antecedente);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeAntecedenteInput, findAll, findOne, add, update, remove };
