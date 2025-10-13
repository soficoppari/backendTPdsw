import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Horario } from './horario.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Turno } from '../Turno/turno.entity.js';
import { EstadoTurno } from '../Turno/turno.enum.js';

const em = ORM.em;

// Middleware de sanitización
function sanitizeHorarioInput(req: Request, res: Response, next: NextFunction) {
  const { horaInicio, horaFin, veterinarioId } = req.body;

  const start = new Date(horaInicio);
  const end = new Date(horaFin);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ message: 'Formato de fecha/hora inválido.' });
  }
  if (start >= end) {
    return res.status(400).json({ message: 'La hora de inicio debe ser anterior a la hora de fin.' });
  }

  req.body.sanitizedInput = { horaInicio: start, horaFin: end, veterinarioId };
  next();
}

// GET /horarios
async function findAll(req: Request, res: Response) {
  try {
    const horarios = await em.find(Horario, {}, { populate: ['veterinario'] });
    res.status(200).json({ message: 'found all horarios', data: horarios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// GET /horarios/:id
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horario = await em.findOneOrFail(Horario, { id }, { populate: ['veterinario'] });
    res.status(200).json({ message: 'found horario', data: horario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const { horarios, veterinarioId } = req.body; // recibimos el array de horarios

    if (!Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({ message: 'No se enviaron horarios válidos.' });
    }

    const veterinario = await em.findOneOrFail(Veterinario, { id: veterinarioId });

    const horariosGuardados: Horario[] = [];

    for (const h of horarios) {
      const { horaInicio, horaFin, diaSemana } = h;

      // Validaciones básicas
      if (!horaInicio || !horaFin || diaSemana == null) {
        continue; // ignoramos horarios inválidos
      }

      // Convertimos strings a objetos Date solo para manipular horas fácilmente
      const inicio = new Date(`1970-01-01T${horaInicio}`);
      const fin = new Date(`1970-01-01T${horaFin}`);

      // Dividimos en slots de 1 hora
      let actual = new Date(inicio);
      while (actual < fin) {
        const siguiente = new Date(actual);
        siguiente.setHours(siguiente.getHours() + 1);

        // Evitamos crear un slot que se pase de la horaFin
        if (siguiente > fin) break;

        const slot = em.create(Horario, {
          horaInicio: actual.toTimeString().slice(0, 8), // "HH:MM:SS"
          horaFin: siguiente.toTimeString().slice(0, 8),
          diaSemana,
          veterinario,
        });

        await em.persistAndFlush(slot);
        horariosGuardados.push(slot);

        actual = siguiente; // avanzamos al próximo bloque
      }
    }

    res
      .status(201)
      .json({ message: 'Horarios creados con éxito', data: horariosGuardados });
  } catch (error: any) {
    console.error('Error al crear los horarios:', error);
    res.status(500).json({ message: error.message });
  }
}


// PATCH /horarios/:id
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horarioToUpdate = await em.findOneOrFail(Horario, { id });
    em.assign(horarioToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'horario updated', data: horarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /horarios/:id
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const horario = em.getReference(Horario, id);
    await em.removeAndFlush(horario);
    res.status(200).json({ message: 'horario deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeHorarioInput, findAll, findOne, add, update, remove };
