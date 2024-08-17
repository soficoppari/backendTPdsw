import { Repository } from '../shared/repository.js'
import { Antecedente } from './antecedente.entity.js'
import {dbA} from '../shared/db/conn.js'
import { ObjectId } from 'mongodb'

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
    const _id = new ObjectId(item.id)
    return (await antecedentes.findOne({ _id })) || undefined
    //return await antecedentes.find((antecedente) => antecedente.id.toString() === item.id
  }

  public async add(item: Antecedente): Promise<Antecedente | undefined> {
    item._id = (await antecedentes.insertOne(item)).insertedId
    return item
  }

  public async update(item: Antecedente): Promise<Antecedente | undefined> {
    const {id, ...antecedenteInput}=item
    const _id = new ObjectId(id)
    return (await antecedentes.findOneAndUpdate({ _id }, { $set: antecedenteInput }, { returnDocument: 'after' })) || undefined
  }

  public async delete(item: { id: string }): Promise<Antecedente | undefined> {
    const _id = new ObjectId(item.id)
    return (await antecedentes.findOneAndDelete({ _id })) || undefined
  }
}