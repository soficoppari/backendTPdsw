import { dbU } from "../shared/bd/conn.js";
import { Repository } from "../shared/repository.js";
import { Usuario } from "./usuario.entity.js";
// import { Mascota } from "../MascotasBag/mascota.entity.js";


// const newmasc= new Mascota("20-21-12-33-11", "george", "sabado")
// const mascotas: Mascota[]=[newmasc]

const usuarioArray = [
  new Usuario(
    'tg56-trg4-t4hg-3rde-uj6t',
    'santino',
    'chibotta',
    'santichibotta@gmail.com',
    341,
    '341',
    //mascotas
    ['loro','perro']
  )
]


const usuario= dbU.collection<Usuario>("LosUsuarios")

export class UsuarioRepository implements Repository<Usuario>{
  public async findAll(): Promise<Usuario[] | undefined> {
    return await usuario.find().toArray()
  }
public async findOne(inst: { id: string; }): Promise<Usuario | undefined> {
 return await usuario.find((c) => c.idUsuario === inst.id)
}
public async add(inst: Usuario): Promise<Usuario | undefined> {
  await usuario.push(inst)
  return inst
}
public async update(inst: Usuario): Promise<Usuario | undefined> {
  const indexC = await usuario.findIndex((c) => c.idUsuario === inst.idUsuario);
  
  if (indexC !== -1) {
    usuario[indexC] = { ...usuario[indexC], ...inst }
  }
  return usuario[indexC]
 }
public async delete(inst: { id: string; }): Promise<Usuario | undefined> {
  const indexC = await usuario.findIndex((c) => c.idUsuario === inst.id);

  if (indexC !== -1) {
    const deletedUsuarios = usuario[indexC]
    usuario.splice(indexC, 1)
    return deletedUsuarios
  }}
}
