import { Router } from 'express';
import {
  sanitizeRazaInput,
  findRazasByEspecie,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './raza.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const razaRouter = Router();

razaRouter.get('/', findAll); // Obtener todas las
razaRouter.get('/especie/:especieId', findRazasByEspecie); // Obtener razas por especie
razaRouter.get('/:id', findOne); // Obtener una  por ID
razaRouter.post(
  '/',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeRazaInput,
  add
); // Crear una
razaRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeRazaInput,
  update
); // Actualizar una  por ID
razaRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  remove
); // Eliminar una  por ID
