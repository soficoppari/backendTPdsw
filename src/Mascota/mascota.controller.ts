import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Mascota } from './mascota.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';

const em = ORM.em;

function sanitizeMascotaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    fechaNacimiento: req.body.fechaNacimiento,
    usuario: req.body.usuario, // Esperamos un id de usuario para la relación
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
    const usuario = await em.findOneOrFail(Usuario, {
      id: req.body.sanitizedInput.usuario,
    }); // Encuentra el usuario por ID
    const mascota = em.create(Mascota, { ...req.body.sanitizedInput, usuario });
    await em.flush();
    res.status(201).json({ message: 'mascota created', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascotaToUpdate = await em.findOneOrFail(Mascota, { id });
    if (req.body.sanitizedInput.usuario) {
      const usuario = await em.findOneOrFail(Usuario, {
        id: req.body.sanitizedInput.usuario,
      });
      req.body.sanitizedInput.usuario = usuario;
    }
    em.assign(mascotaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'mascota updated', data: mascotaToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascota = em.getReference(Mascota, id);
    await em.removeAndFlush(mascota);
    res.status(200).json({ message: 'mascota deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeMascotaInput, findAll, findOne, add, update, remove };
