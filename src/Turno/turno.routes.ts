import { Router } from 'express';
import {
  sanitizeTurnoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './turno.controller.js';

export const horarioRouter = Router();

horarioRouter.get('/', findAll);
horarioRouter.get('/:id', findOne);
horarioRouter.post('/', sanitizeTurnoInput, add);
horarioRouter.put('/:id', sanitizeTurnoInput, update);
horarioRouter.delete('/:id', sanitizeTurnoInput, remove);
