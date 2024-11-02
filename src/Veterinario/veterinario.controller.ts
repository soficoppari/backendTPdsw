import { Request, Response, NextFunction } from 'express';
import { Veterinario } from './veterinario.entity.js';
import { ORM } from '../shared/db/orm.js';
import { Horario } from '../Horario/horario.entity.js';
import { Especie } from '../Especie/especie.entity.js';
const em = ORM.em;

function sanitizeVeterinarioInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    id: req.body.id,
    matricula: req.body.matricula,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    direccion: req.body.direccion,
    nroTelefono: req.body.nroTelefono,
    horarios: req.body.horarios,
    turnos: req.body.turnos,
    especies: req.body.especies,
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(req: Request, res: Response) {
  try {
    // Convierte especieMascota a number
    const especie = Number(req.query.especie);
    console.log('especieMascota recibido:', especie);
    // Verifica que el especie sea un número válido
    if (isNaN(especie)) {
      return res
        .status(400)
        .json({ message: 'El tipo de mascota debe ser un ID numérico válido' });
    }

    // Busca veterinarios que contengan este tipo de mascota y carga los especies asociados
    const veterinarios = await em.find(
      Veterinario,
      {
        especies: { $in: [especie] }, // Busca veterinarios que contengan este tipo de mascota
      },
      { populate: ['especies', 'horarios'] }
    ); // Agrega el populate para incluir los especies

    res
      .status(200)
      .json({ message: 'found matching veterinarios', data: veterinarios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinario = await em.findOneOrFail(
      Veterinario,
      { id },
      { populate: ['especies', 'horarios'] }
    );
    res.status(200).json({ message: 'found veterinario', data: veterinario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Crear instancia de Veterinario sin asignar horarios ni especies todavía
    const veterinario = em.create(Veterinario, {
      ...req.body.sanitizedInput,
      horarios: [],
      especies: [],
    });

    // Agregar horarios si están incluidos en el input
    if (req.body.sanitizedInput.horarios) {
      req.body.sanitizedInput.horarios.forEach(
        (horarioData: {
          dia: string;
          horaInicio: string | Date;
          horaFin: string | Date;
        }) => {
          // Convertir a Date si es necesario
          const horaInicio = new Date(horarioData.horaInicio);
          const horaFin = new Date(horarioData.horaFin);

          // Validar que las fechas sean válidas
          if (isNaN(horaInicio.getTime()) || isNaN(horaFin.getTime())) {
            throw new Error(
              'Los valores de horaInicio o horaFin no son fechas válidas'
            );
          }

          // Crear y asignar horario
          const horario = em.create(Horario, {
            dia: horarioData.dia,
            horaInicio,
            horaFin,
            veterinario,
          });
          veterinario.horarios.add(horario);
        }
      );
    }

    // Agregar especies si están incluidas en el input
    if (req.body.sanitizedInput.especies) {
      req.body.sanitizedInput.especies.forEach((especieId: number) => {
        // Obtener referencia de la especie
        const especie = em.getReference(Especie, especieId);
        veterinario.especies.add(especie);
      });
    }

    // Persistir y guardar el veterinario junto con sus relaciones
    await em.persistAndFlush(veterinario);
    res.status(201).json(veterinario);
  } catch (error) {
    console.error('Error al crear el veterinario:', error);
    res.status(500).json({ message: 'Error al crear el veterinario' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinarioToUpdate = await em.findOneOrFail(Veterinario, { id });
    em.assign(veterinarioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'veterinario updated', data: veterinarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const veterinario = em.getReference(Veterinario, id);
    await em.removeAndFlush(veterinario);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeVeterinarioInput, findAll, findOne, add, update, remove };
