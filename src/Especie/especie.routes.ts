import { Router } from 'express';
import {
  sanitizeEspecieInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './especie.controller.js';

export const especieRouter = Router();

especieRouter.get('/', findAll);
especieRouter.get('/:id', findOne);
especieRouter.post('/', sanitizeEspecieInput, add);
especieRouter.put('/:id', sanitizeEspecieInput, update);
especieRouter.delete('/:id', sanitizeEspecieInput, remove);
