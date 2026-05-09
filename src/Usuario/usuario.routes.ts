import { Router } from 'express';
import {
  sanitizeUsuarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  login,
} from './usuario.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../shared/auth/auth.middleware.js';

export const usuarioRouter = Router();
usuarioRouter.get('/', authenticateToken, authorizeRoles('usuario'), findAll);
usuarioRouter.get('/:id', authenticateToken, authorizeRoles('usuario'), findOne);
usuarioRouter.post('/', sanitizeUsuarioInput, add);
usuarioRouter.put(
  '/:id',
  authenticateToken,
  authorizeRoles('usuario'),
  sanitizeUsuarioInput,
  update
);
usuarioRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('usuario'),
  sanitizeUsuarioInput,
  remove
);
usuarioRouter.post('/login', login);
