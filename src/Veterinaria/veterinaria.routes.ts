import { Router } from "express";
import { sanitizeVeterinariaInput, findAll, findOne, add, update, remove } from "./veterinaria.controler.js";

export const veterinariaRouter= Router()
veterinariaRouter.get('/', findAll)
veterinariaRouter.get('/:id', findOne)
veterinariaRouter.post('/',sanitizeVeterinariaInput, add)
veterinariaRouter.put('/:id',sanitizeVeterinariaInput, update)
veterinariaRouter.patch('/:id',sanitizeVeterinariaInput, update)
veterinariaRouter.delete('/:id',sanitizeVeterinariaInput, remove)