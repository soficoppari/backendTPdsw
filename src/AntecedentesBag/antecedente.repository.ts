import { Repository } from '../shared/repository.js'
import { Antecedente } from './antecedente.entity.js'
import {dbA} from '../shared/bd/conn.js'
import { ObjectId } from 'mongodb'


const antecedentesArray = [
]

const antecedentes =dbA.collection<Antecedente>('LosAntecedentes')

export class AntecedenteRepository implements Repository<Antecedente> {
  public async findAll(): Promise<Antecedente[] | undefined> {
    return await antecedentes.find().toArray()
  }

  public async findOne(inst: { id: string }): Promise<Antecedente | undefined> {
    const _id = new ObjectId(inst.id)
    return (await antecedentes.findOne({ _id })) || undefined
    //return await antecedentes.find((antecedente) => antecedente.id.toString() === item.id
  }

  public async add(inst: Antecedente): Promise<Antecedente | undefined> {
    inst._id = (await antecedentes.insertOne(inst)).insertedId
    return inst
  }

  public async update(id:string,inst: Antecedente): Promise<Antecedente | undefined> {
    const _id = new ObjectId(id)
    return (await antecedentes.findOneAndUpdate({ _id }, { $set:inst}, { returnDocument: 'after' })) || undefined
  }

  public async delete(inst: { id: string }): Promise<Antecedente | undefined> {
    const _id = new ObjectId(inst.id)
    return (await antecedentes.findOneAndDelete({ _id })) || undefined
  }
}