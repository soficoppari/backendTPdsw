import { Request, Response, NextFunction } from 'express';
import { Veterinaria } from './veterinaria.entity.js';
import { ORM } from '../shared/db/orm.js';

const em = ORM.em;

function sanitizeVeterinariaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id: req.body.id,
    contraseniaVet: req.body.contraseniaVet,
    nombreVet: req.body.nombreVet,
    direccion: req.body.direccion,
    nroTelefono: req.body.nroTelefono,
    email: req.body.email,
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
    const veterinarias = await em.find(Veterinaria, {});
    res
      .status(200)
      .json({ message: 'found all veterinarias', data: veterinarias });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinaria = await em.findOneOrFail(Veterinaria, { id });
    res.status(200).json({ message: 'found veterinaria', data: veterinaria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const veterinaria = em.create(Veterinaria, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'veterinaria created', data: veterinaria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinariaToUpdate = await em.findOneOrFail(Veterinaria, { id });
    em.assign(veterinariaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'veterinaria updated', data: veterinariaToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinaria = em.getReference(Veterinaria, id);
    await em.removeAndFlush(veterinaria);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeVeterinariaInput, findAll, findOne, add, update, remove };
