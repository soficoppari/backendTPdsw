import { Request, Response, NextFunction, response } from 'express';
import { Veterinario } from './veterinario.entity.js';
import { ORM } from '../shared/db/orm.js';
import { Horario } from '../Horario/horario.entity.js';
import { Especie } from '../Especie/especie.entity.js';
import bcrypt from 'bcrypt';
import { Calificacion } from '../Calificacion/calificacion.entity.js';
import { Turno } from '../Turno/turno.entity.js';

const em = ORM.em;
//date
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
    email: req.body.email,
    contrasenia: req.body.contrasenia,
    promedio: req.body.promedio,
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
    const especie = Number(req.query.especie);
    if (isNaN(especie)) {
      return res.status(400).json({ message: 'El tipo de mascota debe ser un ID numérico válido' });
    }

    // Busca veterinarios y popula calificaciones
    const veterinarios = await em.find(
      Veterinario,
      { especies: { $in: [especie] } },
      { populate: ['especies', 'horarios', 'calificaciones'] }
    );

    // Calcula el promedio para cada veterinario
    const veterinariosConPromedio = veterinarios.map(vet => {
      let promedio = null;
      if (vet.calificaciones && vet.calificaciones.length > 0) {
        const suma = vet.calificaciones.reduce((acc, c) => acc + c.puntuacion, 0);
        promedio = suma / vet.calificaciones.length;
      }
      // Devuelve el objeto con promedio incluido
      return {
        ...vet,
        promedio,
      };
    });

    res.status(200).json({ message: 'found matching veterinarios', data: veterinariosConPromedio });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// GET /veterinarios/:id
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);

    // Traigo al veterinario con sus horarios y especies
    const veterinario = await em.findOneOrFail(
      Veterinario,
      { id },
      { populate: ['especies', 'horarios'] }
    );

    // Traigo los turnos de ese veterinario
    const turnos = await em.find(
      Turno,
      { veterinario: id },
      { populate: ['horario'] }
    );

    // Filtrar horarios que ya tengan un turno asociado
    const horariosDisponibles = veterinario.horarios.filter(horario => {
      return !turnos.some(turno => turno.horario?.id === horario.id);
    });

    // Armar respuesta para el frontend
    const responseData = {
      id: veterinario.id,
      nombre: veterinario.nombre,
      apellido: veterinario.apellido,
      especies: veterinario.especies.map(e => ({
        id: e.id,
        nombre: e.nombre,
      })),
      horariosDisponibles: horariosDisponibles.map(h => ({
        id: h.id,
        inicio: h.horaInicio.slice(0, 5), // formato HH:mm
        fin: h.horaFin.slice(0, 5),       // formato HH:mm
        diaSemana: h.diaSemana,
      })),
    };

    console.log('Respuesta findOne veterinario:', responseData);

    res.status(200).json({ message: 'found veterinario', data: responseData });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error' });
    }
  }
}

// POST /veterinarios
async function add(req: Request, res: Response) {
  try {
    console.log('Datos completos del input:', req.body.sanitizedInput);

    // Verifica si ya existe un veterinario con el mismo email
    const existingVeterinario = await em.findOne(Veterinario, {
      email: req.body.sanitizedInput.email,
    });
    if (existingVeterinario) {
      return res.status(400).json({ message: 'Email ya en uso' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(
      req.body.sanitizedInput.contrasenia,
      10
    );

    const veterinario = em.create(Veterinario, {
      ...req.body.sanitizedInput,
      contrasenia: hashedPassword,
      horarios: [],
      especies: [],
    });

    req.body.sanitizedInput.horarios.forEach(
  (horarioData: { horaInicio: string; horaFin: string; diaSemana: number }) => {
    // Convertir strings a Date para manipular horas
    const inicio = new Date(`1970-01-01T${horarioData.horaInicio}`);
    const fin = new Date(`1970-01-01T${horarioData.horaFin}`);

    let actual = new Date(inicio);
    while (actual < fin) {
      const siguiente = new Date(actual);
      siguiente.setHours(siguiente.getHours() + 1);

      if (siguiente > fin) break;

      const slot = em.create(Horario, {
        horaInicio: actual.toTimeString().slice(0, 8),
        horaFin: siguiente.toTimeString().slice(0, 8),
        diaSemana: horarioData.diaSemana,
        veterinario,
      });
      veterinario.horarios.add(slot);

      actual = siguiente;
    }
  }
);

    if (req.body.sanitizedInput.especies) {
      req.body.sanitizedInput.especies.forEach((especieId: number) => {
        const especie = em.getReference(Especie, especieId);
        if (especie) {
          veterinario.especies.add(especie);
        }
      });
    }

    await em.persistAndFlush(veterinario);
    res
      .status(201)
      .json({ message: 'Veterinario creado exitosamente', data: veterinario });
  } catch (error: any) {
    console.error('Error en add veterinario:', error);
    res
      .status(500)
      .json({ message: error.message || 'Error al crear el veterinario' });
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

async function actualizarPromedio(veterinarioId: number) {
  const calificaciones = await em.find(Calificacion, {
    veterinario: veterinarioId,
  });
  const promedio = calificaciones.length
    ? calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) /
      calificaciones.length
    : null;

  const veterinario = await em.findOne(Veterinario, { id: veterinarioId });
  if (veterinario) {
    veterinario.promedio = promedio;
    await em.persistAndFlush(veterinario);
  }
}

// GET /veterinarios/:id/horarios-disponibles?fecha=YYYY-MM-DD
async function horariosDisponibles(req: Request, res: Response) {
  const veterinarioId = Number(req.params.id);
  const fechaStr = req.query.fecha as string;
  if (!fechaStr) {
    return res.status(400).json({ message: 'Debe enviar la fecha' });
  }
  const fecha = new Date(fechaStr);
const diaSemana = fecha.getUTCDay(); // <-- Cambia getDay() por getUTCDay()
console.log('Fecha recibida:', fechaStr, '| Fecha interpretada:', fecha, '| Día de semana (UTC):', diaSemana);

  // 1. Traer los horarios recurrentes para ese día de la semana
  const horarios = await em.find(Horario, {
    veterinario: veterinarioId,
    diaSemana,
  });
  console.log('Horarios recurrentes encontrados:', horarios);

  // 2. Traer los turnos ya agendados para ese veterinario y esa fecha
  const fechaUTC = new Date(fechaStr + 'T00:00:00.000Z');
const turnos = await em.find(Turno, {
  veterinario: veterinarioId,
  fecha: fechaUTC,
});
  console.log('Turnos ya agendados:', turnos);

  // 3. Filtrar los horarios que ya tienen turno para esa fecha
  const horariosOcupados = new Set(turnos.map(t => t.horario.id));
  const disponibles = horarios.filter(h => !horariosOcupados.has(h.id));
  console.log('Horarios disponibles después de filtrar:', disponibles);

  // 4. Mapear para frontend
  res.json({
    horariosDisponibles: disponibles.map(h => ({
      id: h.id,
      inicio: h.horaInicio?.slice(0, 5), // "08:00:00" -> "08:00"
      fin: h.horaFin?.slice(0, 5),
      diaSemana: h.diaSemana,
    })),
  });
}

export {
  sanitizeVeterinarioInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  actualizarPromedio,
  horariosDisponibles,
};
