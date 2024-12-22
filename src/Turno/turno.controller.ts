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
      : null; // Obtener usuarioId si está en los parámetros
    const veterinarioId = req.query.veterinarioId
      ? parseInt(req.query.veterinarioId as string)
      : null; // Obtener veterinarioId si está en los parámetros

    // Validar que al menos uno de los parámetros sea proporcionado
    if (!usuarioId && !veterinarioId) {
      return res.status(400).json({
        message:
          'Debe proporcionar un usuarioId o veterinarioId para buscar turnos.',
      });
    }

    // Crear el filtro dinámicamente según el parámetro proporcionado
    const filter = usuarioId
      ? { usuario: { id: usuarioId } }
      : { veterinario: { id: veterinarioId } };

    // Obtener los turnos de la base de datos según el filtro
    const turnos = await em.find(Turno, filter, {
      populate: ['mascota', 'veterinario'], // Relacionar las entidades necesarias
    });

    // Manejar el caso donde no se encuentran turnos
    if (turnos.length === 0) {
      return res
        .status(200)
        .json({ message: 'No se encontraron turnos', data: [] });
    }

    // Responder con los turnos encontrados
    res.status(200).json({ message: 'found turnos', data: turnos });
  } catch (error: any) {
    // Manejo de errores
    res.status(500).json({ message: error.message });
  }
}

// Controlador para obtener tun turno específico
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const turno = await em.findOneOrFail(
      Turno,
      { id },
      {
        populate: ['mascota', 'veterinario'], // Carga las relaciones necesarias
      }
    );
    res.status(200).json({ message: 'found turno', data: turno });
  } catch (error: any) {
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
      estado: EstadoTurno.PENDIENTE,
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

    // Buscar el turno
    const turno = await em.findOne(Turno, { id: parseInt(turnoId, 10) });
    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado.' });
    }

    // Verificar que la fecha del turno sea anterior o igual a la fecha actual
    const ahora = new Date();
    if (new Date(turno.fechaHora) > ahora) {
      return res.status(400).json({
        message: 'El turno no puede completarse porque aún no ha ocurrido.',
      });
    }

    // Cambiar el estado del turno a COMPLETADO
    turno.estado = EstadoTurno.COMPLETADO;
    await em.persistAndFlush(turno);

    res.status(200).json({
      message: 'El turno ha sido marcado como completado.',
      data: turno,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
