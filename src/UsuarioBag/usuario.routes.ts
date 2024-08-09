import { Router } from "express";
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove } from "./usuario.controler.js";

export const usuarioRouter= Router()
usuarioRouter.get('/', findAll)
usuarioRouter.get('/:idUsuario', findOne)
usuarioRouter.post('/',sanitizeUsuarioInput, add)
usuarioRouter.put('/:idUsuario',sanitizeUsuarioInput, update)
usuarioRouter.patch('/:idUsuario',sanitizeUsuarioInput, update)
usuarioRouter.delete('/:idUsuario',sanitizeUsuarioInput, remove)