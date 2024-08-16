import { dbM } from "../shared/bd/conn.js";
import { Repository } from "../shared/repository.js";
import { Mascota } from "./mascota.entity.js";

const mascotaArray = [
  new Mascota(
    'aaaa-bbbb-masc-ota1-0000',
    'luke',
    '2020/10/09',
  )
]

const mascota= dbM.collection<Mascota>("LasMascotas")

export class MascotaRepository implements Repository<Mascota>{
  
  public async findAll(): Promise<Mascota[] | undefined> {
    return await mascota.find().toArray()
  }

  public async findOne(inst: { id: string; }): Promise<Mascota | undefined> {
 return await mascota.find((c) => c.idMascota === inst.id)
}

public async add(inst: Mascota): Promise<Mascota | undefined> {
  await mascota.push(inst)
  return inst
}

public async update(inst: Mascota): Promise<Mascota | undefined> {
  const indexM = await mascota.findIndex((m) => m.idMascota === inst.idMascota);
  
  if (indexM !== -1) {
    mascota[indexM] = { ...mascota[indexM], ...inst }
  }
  return mascota[indexM]
 }

 public async delete(inst: { id: string; }): Promise<Mascota | undefined> {
  const indexC = await mascota.findIndex((c) => c.idMascota === inst.id);

  if (indexC !== -1) {
    const deletedMascotas = mascota[indexC]
    mascota.splice(indexC, 1)
    return deletedMascotas
  }}
}

export{mascota}