import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Mascota } from './mascota.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';
import { Raza } from '../Raza/raza.entity.js';
import jwt from 'jsonwebtoken';

const em = ORM.em;

function sanitizeMascotaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    fechaNacimiento: req.body.fechaNacimiento,
    usuarioId: req.body.usuarioId,
    razaId: req.body.razaId,
    turnos: req.body.turnos,
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
    // Obtener el token desde los headers
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Extraer el token de "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verificar y decodificar el token
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );
    const usuarioId = decodedToken.id; // Extraer el usuarioId del token
    console.log('Usuario ID extraído del token:', usuarioId);

    // Buscar las mascotas asociadas al usuario loggeado
    const mascotas = await em.find(
      Mascota,
      { usuario: { id: usuarioId } },
      { populate: ['usuario', 'raza.especie'] }
    );

    res.status(200).json({ message: 'Mascotas encontradas', data: mascotas });
  } catch (error: any) {
    console.error('Error en findAll:', error); // Imprime el error en la consola del servidor
    res
      .status(500)
      .json({ message: 'Error interno del servidor', details: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascota = await em.findOneOrFail(
      Mascota,
      { id },
      { populate: ['usuario', 'raza'] }
    ); // Poblar usuario
    res.status(200).json({ message: 'found mascota', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const { nombre, fechaNacimiento, usuarioId, razaId } =
      req.body.sanitizedInput;

    // Log para verificar que los datos se reciben correctamente
    console.log('Datos recibidos:', {
      nombre,
      fechaNacimiento,
      usuarioId,
      razaId,
    });

    // Busca el usuario por ID
    const usuario = await em.findOneOrFail(Usuario, { id: usuarioId });
    console.log('Usuario encontrado:', usuario);

    const raza = await em.findOneOrFail(Raza, { id: razaId });
    console.log('Usuario encontrado:', usuario);

    // Crea la mascota asociada al usuario
    const mascota = em.create(Mascota, {
      nombre,
      fechaNacimiento,
      usuario,
      raza,
    });
    console.log('Mascota creada:', mascota);

    await em.flush(); // Guarda en la base de datos
    res.status(201).json({ message: 'Mascota creada', data: mascota });
  } catch (error: any) {
    console.error('Error en el controlador add:', error.message);

    if (error.name === 'EntityNotFoundError') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con más detalles sobre el error
    res
      .status(500)
      .json({ message: 'Error interno del servidor', details: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const mascotaToUpdate = await em.findOneOrFail(Mascota, { id });

    if (req.body.sanitizedInput.usuarioId) {
      const usuario = await em.findOneOrFail(Usuario, {
        id: req.body.sanitizedInput.usuarioId,
      });
      req.body.sanitizedInput.usuario = usuario;
    }

    if (req.body.sanitizedInput.razaId) {
      const raza = await em.findOneOrFail(Raza, {
        id: req.body.sanitizedInput.razaId,
      });
      req.body.sanitizedInput.raza = raza;
    }

    em.assign(mascotaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Mascota actualizada', data: mascotaToUpdate });
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
