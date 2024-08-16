import {Repository } from '../shared/repository.js';
import {Horario} from './horario.entity.js';

const horarios =[
  new Horario(
    new Date("2024-08-09T10:00:00"),
    new Date("2024-08-09T11:00:00"),
    
  ),
]

export class HorarioRepository implements Repository<Horario>{
  public findAll(): Horario[] | undefined {
    return horarios
  }
  //public findOne(item: { id: string }): Horario | undefined {
  //  return horarios.find((horario) => horario.id === item.id)

public findOne(item: { id?: string; fechaI?: Date; fechaF?: Date; }): Horario | undefined {
        if ('fechaI' in item && 'fechaF' in item) {
            return horarios.find(
                (horario) =>
                    horario.FechaHoraIni.getTime() === item.fechaI!.getTime() &&
                    horario.FechaHoraFin.getTime() === item.fechaF!.getTime()
            );
        }
        return undefined;
    }
  

  public add(item: Horario): Horario | undefined {
    horarios.push(item)
    return item
  }

  public update(item: Horario): Horario | undefined {
    const horarioIdx = horarios.findIndex((horario) => 
      horario.FechaHoraIni === item.FechaHoraIni &&
      horario.FechaHoraFin === item.FechaHoraFin)

    if (horarioIdx !== -1) {
      horarios[horarioIdx] = { ...horarios[horarioIdx], ...item }
    }
    return horarios[horarioIdx]
  }

  public delete(item: { id: string; fechaI: Date; fechaF: Date }): Horario | undefined {
    const horarioFechax = horarios.findIndex((horario) => 
      horario.FechaHoraIni === item.fechaI &&
      horario.FechaHoraFin === item.fechaF)

    if (horarioFechax !== -1) {
      const deletedhorarios = horarios[horarioFechax]
      horarios.splice(horarioFechax, 1)
      return deletedhorarios
    }
  }
}