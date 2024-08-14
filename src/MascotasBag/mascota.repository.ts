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

public add(item: Mascota): Mascota | undefined {
  mascota.push(item)
  return item
}

public update(inst: Mascota): Mascota | undefined {
  const indexM = mascota.findIndex((m) => m.idMascota === inst.idMascota);
  
  if (indexM !== -1) {
    mascota[indexM] = { ...mascota[indexM], ...inst }
  }
  return mascota[indexM]
 }

 public delete(mascotas: { id: string; }): Mascota | undefined {
  const indexC = mascota.findIndex((c) => c.idMascota === mascotas.id);

  if (indexC !== -1) {
    const deletedMascotas = mascota[indexC]
    mascota.splice(indexC, 1)
    return deletedMascotas
  }}
}