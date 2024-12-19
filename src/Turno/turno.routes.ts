import { Router } from 'express';
import {
  sanitizeTurnoInput,
  findAll,
  findOne,
  completarTurno,
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
turnoRouter.patch('/turnos/:turnoId/completar', completarTurno);
