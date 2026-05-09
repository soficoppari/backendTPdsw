import { Router } from 'express';
import {
  sanitizeMascotaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './mascota.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const mascotaRouter = Router();

mascotaRouter.use(authenticateToken, authorizeRoles('usuario'));

mascotaRouter.get('/', findAll); // Obtener todas las mascotas
mascotaRouter.get('/:id', findOne); // Obtener una mascota por ID
mascotaRouter.post('/', sanitizeMascotaInput, add); // Crear una mascota
mascotaRouter.put('/:id', sanitizeMascotaInput, update); // Actualizar una mascota por ID
mascotaRouter.delete('/:id', remove); // Eliminar una mascota por ID
