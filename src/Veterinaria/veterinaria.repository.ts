import { dbV } from "../shared/bd/conn.js";
import { Repository } from "../shared/repository.js";
import { Veterinaria } from "./veterinaria.entity.js";

const veterinariasArray = [
  new Veterinaria(
    'tg56-trg4-t4hg-3rde-papa',
    '34121',
    'VetMax',
    'rioja 123',
    3413685420,
    'vetmax@gmail.com'
  )
]

const veterinarias=dbV.collection<Veterinaria>("LasVeterinarias")

export class VeterinariaRepository implements Repository<Veterinaria>{
    public async findAll(): Promise<Veterinaria[] | undefined> {
        return await veterinarias.find().toArray()
    }

    public async findOne(item: { id: string; }): Promise<Veterinaria | undefined> {
        return await veterinarias.find((veterinaria) => veterinaria.idVeterinaria === item.id)
    }

    public async add(item: Veterinaria): Promise<Veterinaria | undefined> {
        await veterinarias.push(item)
        return item
    }


public async update(item: Veterinaria): Promise<Veterinaria | undefined> {
    const veterinariaIdx = await veterinarias.findIndex((veterinaria) => veterinaria.idVeterinaria === item.idVeterinaria)

    if (veterinariaIdx !== -1) {
      veterinarias[veterinariaIdx] = { ...veterinarias[veterinariaIdx], ...item }
    }
    return veterinarias[veterinariaIdx]
  }

public async delete(item: { id: string; }): Promise<Veterinaria | undefined> {
    const veterinariaIdx = await veterinarias.findIndex((veterinaria) => veterinaria.idVeterinaria === item.id);

    if (veterinariaIdx !== -1) {
        const deletedVeterinaria = veterinarias[veterinariaIdx];
        veterinarias.splice(veterinariaIdx, 1);
        return deletedVeterinaria;
    }
}

}