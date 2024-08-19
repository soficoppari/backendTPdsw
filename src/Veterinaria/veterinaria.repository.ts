import { Repository } from "../shared/repository.js";
import { Veterinaria } from "./veterinaria.entity.js";
import { ObjectId } from "mongodb";
import { dbV } from "../shared/bd/conn.js";
import { mascota } from "../MascotasBag/mascota.repository.js";
const veterinariasarray = [
]

const veterinaria = dbV.collection<Veterinaria>('LasVeterinarias')

export class VeterinariaRepository implements Repository<Veterinaria>{
  public async findAll(): Promise<Veterinaria[] | undefined> {
      return await veterinaria.find().toArray()
  }

  public async findOne(inst: { id: string; }): Promise<Veterinaria | undefined> {
    const _id = new ObjectId(inst.id);
    return (await veterinaria.findOne({_id}))||undefined
  }

  public async add(inst: Veterinaria): Promise<Veterinaria | undefined> {
    inst._id = (await veterinaria.insertOne(inst)).insertedId
    return inst
  }

  public async update(id:string,inst:Veterinaria): Promise<Veterinaria | undefined> {
    const _id = new ObjectId(id)
    return (await veterinaria.findOneAndUpdate({_id}, {$set:inst},
      {returnDocument:'after'}))||undefined
  }

  public async delete(inst: { id: string; }): Promise<Veterinaria | undefined> {
      const _id = new ObjectId(inst.id)
      return (await veterinaria.findOneAndDelete({_id}))||undefined
  }

}