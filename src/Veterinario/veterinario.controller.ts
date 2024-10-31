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
    // Convierte tipoMascota a number
    const tipoMascotaId = Number(req.query.tipoMascota);

    // Verifica que el tipoMascotaId sea un número válido
    if (isNaN(tipoMascotaId)) {
      return res
        .status(400)
        .json({ message: 'El tipo de mascota debe ser un ID numérico válido' });
    }

    // Busca veterinarios que contengan este tipo de mascota y carga los especies asociados
    const veterinarios = await em.find(
      Veterinario,
      {
        especies: { $in: [tipoMascotaId] }, // Busca veterinarios que contengan este tipo de mascota
      },
      { populate: ['especies'] }
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
    const veterinario = await em.findOneOrFail(Veterinario, { id });
    res.status(200).json({ message: 'found veterinario', data: veterinario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Crea el veterinario sin los horarios y las especies inicialmente
    const veterinario = em.create(Veterinario, {
      ...req.body.sanitizedInput,
      horarios: [], // Inicializa como vacío para luego asignar los horarios
      especies: [], // Inicializa como vacío para luego asignar las especies
    });

    // Agregar horarios si están incluidos en el input
    if (req.body.sanitizedInput.horarios) {
      req.body.sanitizedInput.horarios.forEach(
        (horarioData: { dia: string; horaInicio: Date; horaFin: Date }) => {
          const horario = em.create(Horario, {
            dia: horarioData.dia,
            horaInicio: horarioData.horaInicio,
            horaFin: horarioData.horaFin,
            veterinario,
          });
          veterinario.horarios.add(horario);
        }
      );
    }

    // Asignar especies si están incluidas en el input
    if (req.body.sanitizedInput.especies) {
      const especies = await em.find(Especie, {
        id: { $in: req.body.sanitizedInput.especies }, // Busca especies por sus IDs
      });
      especies.forEach((especie) => veterinario.especies.add(especie));
    }

    // Guarda el nuevo veterinario y sus relaciones en la base de datos
    await em.flush();

    res.status(201).json({ message: 'Veterinario creado', data: veterinario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
