import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Turno } from './turno.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';
import { Horario } from '../Horario/horario.entity.js';
import jwt from 'jsonwebtoken';
import { EstadoTurno } from './turno.enum.js';

const em = ORM.em;

// Middleware de sanitización
function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    estado: req.body.estado,
    observaciones: req.body.observaciones,
    mascotaId: req.body.mascotaId,
    veterinarioId: req.body.veterinarioId,
    usuarioId: req.body.usuarioId,
    horarioId: req.body.horarioId,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// GET /turnos
async function findAll(req: Request, res: Response) {
  try {
    const usuarioId = req.query.usuarioId
      ? parseInt(req.query.usuarioId as string)
      : null;
    const veterinarioId = req.query.veterinarioId
      ? parseInt(req.query.veterinarioId as string)
      : null;

    if (!usuarioId && !veterinarioId) {
      return res.status(400).json({
        message: 'Debe proporcionar un usuarioId o veterinarioId para buscar turnos.',
      });
    }

    const filter = usuarioId
      ? { usuario: { id: usuarioId } }
      : { veterinario: { id: veterinarioId } };

    const turnos = await em.find(Turno, filter, {
      populate: ['mascota', 'veterinario', 'usuario', 'horario', 'calificacion'],
    });

    if (turnos.length === 0) {
      return res.status(200).json({ message: 'No se encontraron turnos', data: [] });
    }

    // En findAll y findOne, al armar la respuesta:
    const turnosResponse = turnos.map(turno => {
      const fecha = turno.fecha;
      const horaInicio = turno.horario?.horaInicio;
      let fechaHora = null;
      if (fecha && horaInicio) {
        const [h, m, s] = horaInicio.split(':');
        // Asegura que la fecha base es UTC
        const base = new Date(
          Date.UTC(
            fecha.getUTCFullYear(),
            fecha.getUTCMonth(),
            fecha.getUTCDate(),
            Number(h),
            Number(m),
            Number(s || 0),
            0
          )
        );
        fechaHora = base.toISOString();
      }

      return {
  id: turno.id,
  estado: turno.estado,
  observaciones: turno.observaciones,
  fechaHora,
  rango: turno.horario
    ? {
        inicio: turno.horario.horaInicio,
        fin: turno.horario.horaFin,
      }
    : null,
  mascota: turno.mascota
    ? {
        id: turno.mascota.id,
        nombre: turno.mascota.nombre,
        especie: turno.mascota.raza?.especie?.nombre || '',
        usuario: turno.mascota.usuario
          ? {
              id: turno.mascota.usuario.id,
              nombre: turno.mascota.usuario.nombre,
              apellido: turno.mascota.usuario.apellido,
            }
          : null,
      }
    : null,
  veterinario: turno.veterinario
    ? {
        id: turno.veterinario.id,
        nombre: turno.veterinario.nombre,
        apellido: turno.veterinario.apellido,
        matricula: turno.veterinario.matricula,
        direccion: turno.veterinario.direccion,
      }
    : null,
  usuario: turno.usuario // <-- AGREGA ESTA LÍNEA
    ? {
        id: turno.usuario.id,
        nombre: turno.usuario.nombre,
        apellido: turno.usuario.apellido,
      }
    : null,
  calificacion: turno.calificacion
    ? {
        id: turno.calificacion.id,
        puntuacion: turno.calificacion.puntuacion,
      }
    : null,
};
    });

    res.status(200).json({ message: 'found turnos', data: turnosResponse });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);

    const turno = await em.findOneOrFail(
  Turno,
  { id },
  {
    populate: [
      'mascota',
      'mascota.usuario',
      'mascota.raza',
      'mascota.raza.especie',
      'horario',
      'veterinario', // <-- agrega esto
    ],
  }
);

    // En findAll y findOne, al armar la respuesta:
    const fecha = turno.fecha; // Date
    const horaInicio = turno.horario?.horaInicio; // "08:00:00"
    let fechaHora = null;
    if (fecha && horaInicio) {
      // Combinar fecha y hora en string ISO
      const [h, m, s] = horaInicio.split(':');
      // Asegura que la fecha base es UTC
      const base = new Date(
        Date.UTC(
          fecha.getUTCFullYear(),
          fecha.getUTCMonth(),
          fecha.getUTCDate(),
          Number(h),
          Number(m),
          Number(s || 0),
          0
        )
      );
      fechaHora = base.toISOString();
    }

    const m = turno.mascota;
    const h = turno.horario;

    const responseData = {
  id: turno.id,
  estado: turno.estado,
  observaciones: turno.observaciones,
  fechaHora,
  rango: h
    ? {
        inicio: h.horaInicio,
        fin: h.horaFin,
      }
    : null,
  mascota: m
    ? {
        id: m.id,
        nombre: m.nombre,
        especie: m.raza?.especie?.nombre || '',
        usuario: m.usuario
          ? {
              id: m.usuario.id,
              nombre: m.usuario.nombre,
              apellido: m.usuario.apellido,
            }
          : null,
      }
    : null,
  veterinario: turno.veterinario
    ? {
        id: turno.veterinario.id,
        nombre: turno.veterinario.nombre,
        apellido: turno.veterinario.apellido,
      }
    : null,
};

    res.status(200).json({ data: responseData });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// POST /turnos
async function add(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const usuarioId = decoded.id;

    const { mascotaId, veterinarioId, horarioId, fecha } = req.body;

    if (!mascotaId || !veterinarioId || !horarioId || !fecha) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const mascota = await em.findOne(Mascota, { id: mascotaId }, { populate: ['usuario'] });
    const veterinario = await em.findOne(Veterinario, { id: veterinarioId });
    const usuario = await em.findOne(Usuario, { id: usuarioId });
    const horario = await em.findOne(Horario, { id: horarioId });

    if (!mascota || !veterinario || !usuario || !horario) {
      return res.status(404).json({ message: 'Entidad no encontrada' });
    }

    if (mascota.usuario.id !== usuarioId) {
      return res.status(403).json({ message: 'La mascota no pertenece al usuario' });
    }

    // Convertir la fecha recibida a UTC (medianoche UTC)
    // Si recibes "2025-09-17", esto será "2025-09-17T00:00:00.000Z"
    const fechaUTC = new Date(fecha + 'T00:00:00.000Z');

    // Validar si el horario ya está ocupado
    const turnoExistente = await em.findOne(Turno, {
      horario: horarioId,
      veterinario: veterinarioId,
      fecha: fechaUTC,
    });
    if (turnoExistente) {
      return res.status(409).json({ message: 'Ese horario ya está reservado para esa fecha' });
    }

    const turno = em.create(Turno, {
      fecha: fechaUTC,
      estado: EstadoTurno.AGENDADO,
      mascota,
      veterinario,
      usuario,
      horario,
    });

    await em.persistAndFlush(turno);

    res.status(201).json({ message: 'Turno creado con éxito', data: turno });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function completarTurno(req: Request, res: Response) {
  try {
    const { turnoId } = req.params;
    const { observaciones } = req.body;

    const turno = await em.findOne(Turno, { id: parseInt(turnoId, 10) }, { populate: ['horario'] });
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado.' });

    // Combinar la fecha del turno con la hora fin del horario
    const [h, m] = turno.horario.horaFin.split(':').map(Number);
    const fechaFin = new Date(turno.fecha); // suponiendo que Turno tiene "fecha" (Date)
    fechaFin.setHours(h, m, 0, 0);

    if (fechaFin > new Date()) {
      return res.status(400).json({
        message: 'El turno no puede completarse porque aún no ha ocurrido.',
      });
    }

    turno.estado = EstadoTurno.COMPLETADO;
    turno.observaciones = observaciones || null;

    await em.persistAndFlush(turno);

    return res.status(200).json({ message: 'Turno completado con éxito.' });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Error del servidor al completar el turno.',
      error: error.message,
    });
  }
}


async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turnoToUpdate = await em.findOneOrFail(Turno, { id });
    em.assign(turnoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'turno updated', data: turnoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// DELETE /turnos/:id
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turno = em.getReference(Turno, id);
    await em.removeAndFlush(turno);
    res.status(200).json({ message: 'turno deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeTurnoInput,
  findAll,
  findOne,
  add,
  completarTurno,
  update,
  remove,
};
