import { Router } from 'express';
import {
  sanitizeRazaInput,
  findRazasByEspecie,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './raza.controller.js';

export const razaRouter = Router();

razaRouter.get('/', findAll); // Obtener todas las
razaRouter.get('/:id', findOne); // Obtener una  por ID
razaRouter.get('/especie/:especieId', findRazasByEspecie); // Obtener razas por especie
razaRouter.post('/', sanitizeRazaInput, add); // Crear una
razaRouter.put('/:id', sanitizeRazaInput, update); // Actualizar una  por ID
razaRouter.delete('/:id', remove); // Eliminar una  por ID
