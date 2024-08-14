import { Repository } from "../shared/repository.js";
import { Veterinaria } from "./veterinaria.entity.js";

const veterinarias = [
  new Veterinaria(
    'tg56-trg4-t4hg-3rde-papa',
    '34121',
    'VetMax',
    'rioja 123',
    3413685420,
    'vetmax@gmail.com'
  )
]

export class VeterinariaRepository implements Repository<Veterinaria>{
    public findAll(): Veterinaria[] | undefined {
        return veterinarias
    }

    public findOne(item: { id: string; }): Veterinaria | undefined {
        return veterinarias.find((veterinaria) => veterinaria.idVeterinaria === item.id)
    }

    public add(item: Veterinaria): Veterinaria | undefined {
        veterinarias.push(item)
        return item
    }


public update(item: Veterinaria): Veterinaria | undefined {
    const veterinariaIdx = veterinarias.findIndex((veterinaria) => veterinaria.idVeterinaria === item.idVeterinaria)

    if (veterinariaIdx !== -1) {
      veterinarias[veterinariaIdx] = { ...veterinarias[veterinariaIdx], ...item }
    }
    return veterinarias[veterinariaIdx]
  }

public delete(item: { id: string; }): Veterinaria | undefined {
    const veterinariaIdx = veterinarias.findIndex((veterinaria) => veterinaria.idVeterinaria === item.id);

    if (veterinariaIdx !== -1) {
        const deletedVeterinaria = veterinarias[veterinariaIdx];
        veterinarias.splice(veterinariaIdx, 1);
        return deletedVeterinaria;
    }
}

}