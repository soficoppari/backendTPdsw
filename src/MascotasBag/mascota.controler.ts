import { Request, Response, NextFunction } from 'express';
import { Mascota } from './mascota.entity.js';
import { ORM } from '../shared/db/orm.js';

const em = ORM.em;

function sanitizeMascotaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    idMascota: req.body.idMascota,
    nombre: req.body.nombre,
    fechaNac: req.body.fechaNac,
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
    const mascotas = await em.find(Mascota, {});
    res.status(200).json({ message: 'found all mascotas', data: mascotas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascota = await em.findOneOrFail(Mascota, { id });
    res.status(200).json({ message: 'found mascota', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const mascota = em.create(Mascota, req.body);
    await em.flush();
    res.status(201).json({ message: 'mascota created', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascota = em.getReference(Mascota, id);
    em.assign(mascota, req.body);
    await em.flush();
    res.status(200).json({ message: 'mascota updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascota = em.getReference(Mascota, id);
    await em.removeAndFlush(mascota);
    res.status(200).send({ message: 'mascota deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeMascotaInput, findAll, findOne, add, update, remove };
