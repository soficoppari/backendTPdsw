import { Repository } from "../shared/repository.js";
import { Usuario } from "./usuario.entity.js";
// import { Mascota } from "../MascotasBag/mascota.entity.js";

// const newmasc= new Mascota("20-21-12-33-11", "george", "sabado")
// const mascotas: Mascota[]=[newmasc]

const usuario = [
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

export class UsuarioRepository implements Repository<Usuario>{
  public findAll(): Usuario[] | undefined {
    return usuario
  }
public findOne(mascotas: { id: string; }): Usuario | undefined {
 return usuario.find((c) => c.idUsuario === mascotas.id)
}
public add(mascotas: Usuario): Usuario | undefined {
  usuario.push(mascotas)
  return mascotas
}
public update(mascotas: Usuario): Usuario | undefined {
  const indexC = usuario.findIndex((c) => c.idUsuario === mascotas.idUsuario);
  
  if (indexC !== -1) {
    usuario[indexC] = { ...usuario[indexC], ...mascotas }
  }
  return usuario[indexC]
 }
public delete(mascotas: { id: string; }): Usuario | undefined {
  const indexC = usuario.findIndex((c) => c.idUsuario === mascotas.id);

  if (indexC !== -1) {
    const deletedUsuarios = usuario[indexC]
    usuario.splice(indexC, 1)
    return deletedUsuarios
  }}
}
