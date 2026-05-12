import { Router } from 'express';
import {
  sanitizeUsuarioInput,
  findAll,
  findOne,
  findAuthenticated,
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
usuarioRouter.get(
  '/me',
  authenticateToken,
  authorizeRoles('usuario'),
  findAuthenticated
);
usuarioRouter.get('/:id', authenticateToken, findOne);
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
