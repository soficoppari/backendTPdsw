import { Request, Response, NextFunction } from 'express'
import { AntecedenteRepository } from './antecedente.repository.js'
import { Antecedente } from './antecedente.entity.js'

const repository = new AntecedenteRepository()

function sanitizeAntecedenteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
    nombreMotivo: req.body.nombreMotivo,
    id: req.body.id
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  res.json({ data: await repository.findAll() })
}

async function findOne(req: Request, res: Response) {
  const id = req.params.id
  const antecedente = await repository.findOne({ id })
  if (!antecedente) {
    return res.status(404).send({ message: 'Antecedente not found' })
  }
  res.json({ data: antecedente })
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const antecedenteInput = new Antecedente(
    input.descripcion,
    input.fecha,
    input.nombreMotivo,
    input.id
  )

  const antecedente = await repository.add(antecedenteInput)
  return res.status(201).send({ message: 'Antecedente created', data: antecedente })
}

async function update(req: Request, res: Response) {
  const antecedente = await repository.update(req.params.id,req.body.sanitizedInput)

  if (!antecedente) {
    return res.status(404).send({ message: 'Antecedente not found' })
  }

  return res.status(200).send({ message: 'Antecedente updated successfully', data: antecedente })
}

async function remove(req: Request, res: Response) {
  const id = req.params.id
  const antecedente = await repository.delete({ id })

  if (!antecedente) {
    res.status(404).send({ message: 'Antecedente not found' })
  } else {
    res.status(200).send({ message: 'Antecedente deleted successfully' })
  }
}

export { sanitizeAntecedenteInput, findAll, findOne, add, update, remove }