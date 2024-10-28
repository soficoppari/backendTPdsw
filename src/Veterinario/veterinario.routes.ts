import { Router } from 'express';
import {
  sanitizeVeterinarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './veterinario.controller.js';

export const veterinarioRouter = Router();
veterinarioRouter.get('/', findAll);
veterinarioRouter.get('/:id', findOne);
veterinarioRouter.post('/', sanitizeVeterinarioInput, add);
veterinarioRouter.put('/:id', sanitizeVeterinarioInput, update);
veterinarioRouter.patch('/:id', sanitizeVeterinarioInput, update);
veterinarioRouter.delete('/:id', sanitizeVeterinarioInput, remove);
