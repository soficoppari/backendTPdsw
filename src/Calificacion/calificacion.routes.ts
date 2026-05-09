import { Router } from 'express';
import {
  sanitizeCalificacionInput,
  findAll,
  findOne,
  add,
} from './calificacion.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const calificacionRouter = Router();

calificacionRouter.get('/', findAll);
calificacionRouter.get('/:id', findOne);
calificacionRouter.post(
  '/',
  authenticateToken,
  authorizeRoles('usuario'),
  sanitizeCalificacionInput,
  add
);
//calificacionRouter.put('/:id', sanitizeCalificacionInput, update);
//calificacionRouter.delete('/:id', sanitizeCalificacionInput, remove);
