import { Repository } from '../shared/repository.js'
import { Antecedente } from './antecedente.entity.js'
import {db} from '../shared/db/conn.js'

const antecedentesArray = [
  new Antecedente(
  'deschistoria',
  new Date("2024-09-12T10:00:00"),
  'nombremotivo',
  1
  ),
]

const antecedentes =dbA.collection<Antecedente>('LosAntecedentes')

export class AntecedenteRepository implements Repository<Antecedente> {
  public async findAll(): Promise<Antecedente[] | undefined> {
    return await antecedentes.find().toArray()
  }

  public async findOne(item: { id: string }): Promise<Antecedente | undefined> {
    return await antecedentes.find((antecedente) => antecedente.id.toString() === item.id)
  }

  public async add(item: Antecedente): Promise<Antecedente | undefined> {
    await antecedentes.push(item)
    return item
  }

  public async update(item: Antecedente): Promise<Antecedente | undefined> {
    const antecedenteIdx = await antecedentes.findIndex((antecedente) => antecedente.id == item.id)

    if (antecedenteIdx !== -1) {
      antecedentes[antecedenteIdx] = { ...antecedentes[antecedenteIdx], ...item }
    }
    return antecedentes[antecedenteIdx]
  }

  public async delete(item: { id: string }): Promise<Antecedente | undefined> {
    const antecedenteIdx = await antecedentes.findIndex((antecedente) => antecedente.id.toString() === item.id)

    if (antecedenteIdx !== -1) {
      const deletedAntecedentes = antecedentes[antecedenteIdx]
      antecedentes.splice(antecedenteIdx, 1)
      return deletedAntecedentes
    }
  }
}