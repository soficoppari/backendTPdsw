import { Router } from "express";
import { sanitizeVeterinariaInput, findAll, findOne, add, update, remove } from "./veterinaria.controler.js";

export const veterinariaRouter= Router()
veterinariaRouter.get('/', findAll)
veterinariaRouter.get('/:idVeterinaria', findOne)
veterinariaRouter.post('/',sanitizeVeterinariaInput, add)
veterinariaRouter.put('/:idVeterinaria',sanitizeVeterinariaInput, update)
veterinariaRouter.patch('/:idVeterinaria',sanitizeVeterinariaInput, update)
veterinariaRouter.delete('/:idVeterinaria',sanitizeVeterinariaInput, remove)