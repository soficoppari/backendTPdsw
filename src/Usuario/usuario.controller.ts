import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Usuario } from './usuario.entity.js';
//import bcrypt from 'bcrypt';

const em = ORM.em;

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    nroTelefono: req.body.nroTelefono,
    contraseniaUser: req.body.contraseniaUser,
    mascotas: req.body.mascotas,
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
    const usuarios = await em.find(Usuario, {});
    res.status(200).json({ message: 'found all usuarios', data: usuarios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });
    res.status(200).json({ message: 'found usuario', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Verifica si ya existe un usuario con el mismo email
    const existingUser = await em.findOne(Usuario, {
      email: req.body.sanitizedInput.email,
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Encriptar la contraseña
    //const hashedPassword = await bcrypt.hash(
    //req.body.sanitizedInput.contraseniaUser,
    // 10
    //);
    //req.body.sanitizedInput.contraseniaUser = hashedPassword;

    const usuario = em.create(Usuario, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Usuario created', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuarioToUpdate = await em.findOneOrFail(Usuario, { id });
    em.assign(usuarioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'usuario updated', data: usuarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = em.getReference(Usuario, id);
    await em.removeAndFlush(usuario);
    res.status(200).json({ message: 'usuario deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove };
