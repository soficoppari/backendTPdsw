import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Tipo } from './tipo.entity.js';

const em = ORM.em;

function sanitizeTipoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
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
    const tipos = await em.find(Tipo, {});
    res.status(200).json({ message: 'found all tipos', data: tipos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipo = await em.findOneOrFail(Tipo, { id });
    res.status(200).json({ message: 'found tipo', data: tipo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const tipo = em.create(Tipo, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'tipo created', data: tipo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipoToUpdate = await em.findOneOrFail(Tipo, { id });
    em.assign(tipoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'tipo updated', data: tipoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const tipo = em.getReference(Tipo, id);
    await em.removeAndFlush(tipo);
    res.status(200).json({ message: 'tipo deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeTipoInput, findAll, findOne, add, update, remove };
