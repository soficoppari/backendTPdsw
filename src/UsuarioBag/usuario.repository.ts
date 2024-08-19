import { ObjectId } from "mongodb";
import { dbU } from "../shared/bd/conn.js";
import { Repository } from "../shared/repository.js";
import { Usuario } from "./usuario.entity.js";
// import { Mascota } from "../MascotasBag/mascota.entity.js";


// const newmasc= new Mascota("20-21-12-33-11", "george", "sabado")
// const mascotas: Mascota[]=[newmasc]

const usuarioArray = [
]


const usuario= dbU.collection<Usuario>('LosUsuarios')

export class UsuarioRepository implements Repository<Usuario>{
  public async findAll(): Promise<Usuario[] | undefined> {
    return await usuario.find().toArray()
  }


public async findOne(inst: { id: string; }): Promise<Usuario | undefined> {
 const _id = new ObjectId(inst.id);
 return (await usuario.findOne({_id}))||undefined
}

public async add(inst: Usuario): Promise<Usuario | undefined> {
  inst._id=(await usuario.insertOne(inst)).insertedId
  return inst
}

public async update(id:string,inst: Usuario): Promise<Usuario | undefined> {
  const _id = new ObjectId(id)
  return (await usuario.findOneAndUpdate({_id}, {$set:inst}, 
  {returnDocument: 'after'})) || undefined
 }

public async delete(inst: { id: string; }): Promise<Usuario | undefined> {
  const _id = new ObjectId(inst.id)
  return (await usuario.findOneAndDelete({_id})) || undefined
}
}