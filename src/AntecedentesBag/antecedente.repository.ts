import { Repository } from '../shared/repository.js'
import { Antecedente } from './antecedente.entity.js'

const antecedentes = [
  new Antecedente(
  'deschistoria',
  new Date("2024-09-12T10:00:00"),
  'nombremotivo',
  1
  ),
]

export class AntecedenteRepository implements Repository<Antecedente> {
  public findAll(): Antecedente[] | undefined {
    return antecedentes
  }

  public findOne(item: { id: string }): Antecedente | undefined {
    return antecedentes.find((antecedente) => antecedente.id.toString() === item.id)
  }

  public add(item: Antecedente): Antecedente | undefined {
    antecedentes.push(item)
    return item
  }

  public update(item: Antecedente): Antecedente | undefined {
    const antecedenteIdx = antecedentes.findIndex((antecedente) => antecedente.id == item.id)

    if (antecedenteIdx !== -1) {
      antecedentes[antecedenteIdx] = { ...antecedentes[antecedenteIdx], ...item }
    }
    return antecedentes[antecedenteIdx]
  }

  public delete(item: { id: string }): Antecedente | undefined {
    const antecedenteIdx = antecedentes.findIndex((antecedente) => antecedente.id.toString() === item.id)

    if (antecedenteIdx !== -1) {
      const deletedAntecedentes = antecedentes[antecedenteIdx]
      antecedentes.splice(antecedenteIdx, 1)
      return deletedAntecedentes
    }
  }
}