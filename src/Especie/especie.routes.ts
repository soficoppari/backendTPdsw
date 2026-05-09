import { Router } from 'express';
import {
  sanitizeEspecieInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './especie.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const especieRouter = Router();

especieRouter.get('/', findAll);
especieRouter.get('/:id', findOne);
especieRouter.post(
  '/',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeEspecieInput,
  add
);
especieRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeEspecieInput,
  update
);
especieRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('veterinario'),
  sanitizeEspecieInput,
  remove
);
