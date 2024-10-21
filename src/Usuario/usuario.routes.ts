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

export const usuarioRouter = Router();
usuarioRouter.get('/', findAll);
usuarioRouter.get('/:id', findOne);
usuarioRouter.post('/', sanitizeUsuarioInput, add);
usuarioRouter.put('/:id', sanitizeUsuarioInput, update);
usuarioRouter.delete('/:id', sanitizeUsuarioInput, remove);
usuarioRouter.post('/login', login);
