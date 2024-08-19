import { Router } from "express";
import { sanitizeMascotaInput, findAll, findOne, add, update, remove } from "./mascota.controler.js";

export const mascotaRouter= Router()
mascotaRouter.get('/', findAll)
mascotaRouter.get('/:idMascota', findOne)
mascotaRouter.post('/',sanitizeMascotaInput, add)
mascotaRouter.put('/:idMascota',sanitizeMascotaInput, update)
mascotaRouter.patch('/:idMascota',sanitizeMascotaInput, update)
mascotaRouter.delete('/:idMascota',sanitizeMascotaInput, remove)