import { Repository } from "../shared/repository.js";
import { Mascota } from "./mascota.entity.js";

const mascota = [
  new Mascota(
    'aaaa-bbbb-masc-ota1-0000',
    'luke',
    '2020/10/09',
  )
]


export class MascotaRepository implements Repository<Mascota>{
  
  public findAll(): Mascota[] | undefined {
    return mascota
  }
public findOne(mascotas: { id: string; }): Mascota | undefined {
 return mascota.find((c) => c.idMascota === mascotas.id)
}
public add(mascotas: Mascota): Mascota | undefined {
  mascota.push(mascotas)
  return mascotas
}
public update(mascotas: Mascota): Mascota | undefined {
  const indexC = mascota.findIndex((c) => c.idMascota === mascotas.idMascota);
  
  if (indexC !== -1) {
    mascota[indexC] = { ...mascota[indexC], ...mascotas }
  }
  return mascota[indexC]
 }
public delete(mascotas: { id: string; }): Mascota | undefined {
  const indexC = mascota.findIndex((c) => c.idMascota === mascotas.id);

  if (indexC !== -1) {
    const deletedMascotas = mascota[indexC]
    mascota.splice(indexC, 1)
    return deletedMascotas
  }}
}