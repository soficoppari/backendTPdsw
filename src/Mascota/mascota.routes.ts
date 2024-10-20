import { Router } from 'express';
import {
  sanitizeMascotaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './mascota.controller.js';

export const mascotaRouter = Router();

mascotaRouter.get('/', findAll); // Obtener todas las mascotas
mascotaRouter.get('/:id', findOne); // Obtener una mascota por ID
mascotaRouter.post('/', sanitizeMascotaInput, add); // Crear una mascota
mascotaRouter.put('/:id', sanitizeMascotaInput, update); // Actualizar una mascota por ID
mascotaRouter.delete('/:id', remove); // Eliminar una mascota por ID
