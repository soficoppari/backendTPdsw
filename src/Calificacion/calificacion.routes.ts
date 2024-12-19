import { Router } from 'express';
import {
  sanitizeCalificacionInput,
  findAll,
} from './calificacion.controller.js';

export const calificacionRouter = Router();

calificacionRouter.get('/', findAll);
//calificacionRouter.get('/:id', findOne);
//calificacionRouter.post('/', sanitizeCalificacionInput, add);
//calificacionRouter.put('/:id', sanitizeCalificacionInput, update);
//calificacionRouter.delete('/:id', sanitizeCalificacionInput, remove);
