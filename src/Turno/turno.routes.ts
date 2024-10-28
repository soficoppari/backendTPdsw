import { Router } from 'express';
import {
  sanitizeTurnoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './turno.controller.js';

export const turnoRouter = Router();

turnoRouter.get('/', findAll);
turnoRouter.get('/:id', findOne);
turnoRouter.post('/', sanitizeTurnoInput, add);
turnoRouter.put('/:id', sanitizeTurnoInput, update);
turnoRouter.delete('/:id', sanitizeTurnoInput, remove);
