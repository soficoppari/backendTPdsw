import { ObjectId } from "mongodb";
import { dbM } from "../shared/bd/conn.js";
import { Repository } from "../shared/repository.js";
import { Mascota } from "./mascota.entity.js";

const mascotaArray = [
]

const mascota= dbM.collection<Mascota>('LasMascotas')

export class MascotaRepository implements Repository<Mascota>{
  public async findAll():Promise<Mascota[] | undefined> {
    return await mascota.find().toArray()
  }

public async findOne(inst: { id: string; }): Promise<Mascota | undefined> {
  const _id = new ObjectId(inst.id);
  return (await mascota.findOne({_id})) || undefined
}

public async add(inst: Mascota): Promise<Mascota | undefined> {
  inst._id=(await mascota.insertOne(inst)).insertedId
  return inst
}

public async update(id:string,inst: Mascota): Promise<Mascota | undefined> {
  const _id = new ObjectId(id)
  return (await mascota.findOneAndUpdate({_id},{$set:inst},
  {returnDocument: 'after'})||undefined
  )
 }

 public async delete(inst: { id: string; }): Promise<Mascota | undefined> {
  const _id = new ObjectId(inst.id)
  return (await mascota.findOneAndDelete({_id}))||undefined
  }
}

export{mascota}
