import { Router } from 'express'
import { sanitizeAntecedenteInput, findAll, findOne, add, update, remove } from './antecedente.controler.js'

export const antecedenteRouter = Router()

antecedenteRouter.get('/', findAll)
antecedenteRouter.get('/:id', findOne)
antecedenteRouter.post('/', sanitizeAntecedenteInput, add)
antecedenteRouter.put('/:id', sanitizeAntecedenteInput, update)
antecedenteRouter.patch('/:id', sanitizeAntecedenteInput, update)
antecedenteRouter.delete('/:id', remove)