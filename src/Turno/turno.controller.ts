import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Turno } from './turno.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';
import jwt from 'jsonwebtoken';
import { EstadoTurno } from './turno.enum.js';

const em = ORM.em;

// Middleware de sanitización
function sanitizeTurnoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    estado: req.body.estado,
    fechaHora: req.body.fechaHora,
    observaciones: req.body.observaciones,
    mascotaId: req.body.mascotaId,
    veterinarioId: req.body.veterinarioId,
    usuarioId: req.body.usuarioId,
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
    const usuarioId = req.query.usuarioId
      ? parseInt(req.query.usuarioId as string)
      : null;
    const veterinarioId = req.query.veterinarioId
      ? parseInt(req.query.veterinarioId as string)
      : null;

    console.log('Parametros recibidos:', { usuarioId, veterinarioId });

    if (!usuarioId && !veterinarioId) {
      return res.status(400).json({
        message:
          'Debe proporcionar un usuarioId o veterinarioId para buscar turnos.',
      });
    }

    const filter = usuarioId
      ? { usuario: { id: usuarioId } }
      : { veterinario: { id: veterinarioId } };

    console.log('Filtro aplicado:', filter);

    const turnos = await em.find(Turno, filter, {
      populate: ['mascota', 'veterinario', 'usuario', 'calificacion'],
    });

    console.log('Turnos encontrados:', turnos);

    if (turnos.length === 0) {
      return res
        .status(200)
        .json({ message: 'No se encontraron turnos', data: [] });
    }

    res.status(200).json({ message: 'found turnos', data: turnos });
  } catch (error: any) {
    console.error('Error al buscar turnos:', error);
    res.status(500).json({ message: error.message });
  }
}

// Controlador para obtener un turno específico
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    console.log('Buscando turno con ID:', id);

    const turno = await em.findOneOrFail(
      Turno,
      { id },
      {
        populate: ['mascota', 'veterinario'],
      }
    );

    console.log('Turno encontrado:', turno);

    res.status(200).json({ message: 'found turno', data: turno });
  } catch (error: any) {
    console.error('Error al buscar turno:', error);
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    // Obtener el token desde los headers
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Extraer el token de "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verificar y decodificar el token
    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );
    const usuarioId = decodedToken.id; // Extraer el usuarioId del token
    console.log('Usuario ID extraído del token:', usuarioId);

    // Obtener datos del cuerpo de la solicitud
    const { mascotaId, veterinarioId, fechaHora } = req.body;

    // Validación de datos requeridos
    if (!mascotaId || !veterinarioId || !fechaHora) {
      return res.status(400).json({
        message: 'Faltan datos requeridos: mascotaId, veterinarioId, fechaHora',
      });
    }

    // Validación de fecha
    if (isNaN(Date.parse(fechaHora))) {
      return res.status(400).json({ message: 'fechaHora es inválida' });
    }

    // Verificar existencia de la mascota, veterinario y usuario
    const mascota = await em.findOne(
      Mascota,
      { id: mascotaId },
      { populate: ['usuario'] }
    );
    const veterinario = await em.findOne(Veterinario, { id: veterinarioId });
    const usuario = await em.findOne(Usuario, { id: usuarioId });

    if (!mascota) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    if (!veterinario) {
      return res.status(404).json({ message: 'Veterinario no encontrado' });
    }
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar que la mascota pertenece al usuario autenticado
    if (mascota.usuario.id !== usuarioId) {
      return res.status(403).json({
        message: 'La mascota no pertenece al usuario autenticado',
      });
    }

    // Verificar conflictos de turnos
    const turnoExistente = await em.findOne(Turno, {
      fechaHora,
      veterinario: veterinarioId,
    });

    if (turnoExistente) {
      return res.status(409).json({
        message:
          'El veterinario ya tiene un turno asignado en esa fecha y hora',
      });
    }

    // Crear y guardar el turno
    const turno = em.create(Turno, {
      estado: EstadoTurno.AGENDADO,
      fechaHora,
      mascota,
      veterinario,
      usuario, // Usamos el objeto completo de usuario aquí
    });

    await em.persistAndFlush(turno);

    return res
      .status(201)
      .json({ message: 'Turno creado con éxito', data: turno });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function completarTurno(req: Request, res: Response) {
  try {
    const { turnoId } = req.params;
    const { observaciones } = req.body;

    const turno = await em.findOne(Turno, { id: parseInt(turnoId, 10) });
    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado.' });
    }

    const ahora = new Date();
    if (new Date(turno.fechaHora) > ahora) {
      return res.status(400).json({
        message: 'El turno no puede completarse porque aún no ha ocurrido.',
      });
    }

    turno.estado = EstadoTurno.COMPLETADO;
    turno.observaciones = observaciones || null;

    await em.persistAndFlush(turno);

    return res.status(200).json({ message: 'Turno completado con éxito.' });
  } catch (error) {
    console.error('Error al completar el turno:', error); 
    return res.status(500).json({
      message: 'Error del servidor al completar el turno.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turnoToUpdate = await em.findOneOrFail(Turno, { id });
    em.assign(turnoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'horario updated', data: turnoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

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
