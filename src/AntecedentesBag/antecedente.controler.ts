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

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const antecedente = repository.findOne({ id })
  if (!antecedente) {
    return res.status(404).send({ message: 'Antecedente not found' })
  }
  res.json({ data: antecedente })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const antecedenteInput = new Antecedente(
    input.descripcion,
    input.fecha,
    input.nombreMotivo,
    input.id
  )

  const antecedente = repository.add(antecedenteInput)
  return res.status(201).send({ message: 'Antecedente created', data: antecedente })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const antecedente = repository.update(req.body.sanitizedInput)

  if (!antecedente) {
    return res.status(404).send({ message: 'Antecedente not found' })
  }

  return res.status(200).send({ message: 'Antecedente updated successfully', data: antecedente })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const antecedente = repository.delete({ id })

  if (!antecedente) {
    res.status(404).send({ message: 'Antecedente not found' })
  } else {
    res.status(200).send({ message: 'Antecedente deleted successfully' })
  }
}

export { sanitizeAntecedenteInput, findAll, findOne, add, update, remove }