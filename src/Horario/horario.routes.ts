import { Router } from 'express';
import {
  sanitizeHorarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './horario.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const horarioRouter = Router();

horarioRouter.use(authenticateToken, authorizeRoles('veterinario'));

horarioRouter.get('/', findAll);
horarioRouter.get('/:id', findOne);
horarioRouter.post('/', sanitizeHorarioInput, add);
horarioRouter.put('/:id', sanitizeHorarioInput, update);
horarioRouter.delete('/:id', sanitizeHorarioInput, remove);
