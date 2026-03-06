import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('../../src/shared/db/orm.js', () => ({
  ORM: {
    em: {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      assign: jest.fn(),
      flush: jest.fn(),
      persistAndFlush: jest.fn(),
      removeAndFlush: jest.fn(),
      getReference: jest.fn(),
    },
  },
}));

import { sanitizeVeterinarioInput, findAll, findOne, add, update, remove, horariosDisponibles } from '../../src/Veterinario/veterinario.controller.js';
import { ORM } from '../../src/shared/db/orm.js';
import { Veterinario } from '../../src/Veterinario/veterinario.entity.js';
import { Horario } from '../../src/Horario/horario.entity.js';
import { Especie } from '../../src/Especie/especie.entity.js';
import { Turno } from '../../src/Turno/turno.entity.js';

describe('Veterinario Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('sanitizeVeterinarioInput', () => {
    it('should sanitize input and call next', () => {
      mockReq.body = {
        id: 1,
        matricula: '12345',
        nombre: 'Dr. Smith',
        apellido: 'Doe',
        direccion: '123 Main St',
        nroTelefono: '123456789',
        email: 'smith@example.com',
        contrasenia: 'password',
        promedio: 4.5,
        horarios: [],
        turnos: [],
        especies: [],
        extraField: 'should be removed',
      };

      sanitizeVeterinarioInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        matricula: '12345',
        nombre: 'Dr. Smith',
        apellido: 'Doe',
        direccion: '123 Main St',
        nroTelefono: '123456789',
        email: 'smith@example.com',
        contrasenia: 'password',
        promedio: 4.5,
        horarios: [],
        turnos: [],
        especies: [],
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove undefined properties', () => {
      mockReq.body = {
        nombre: 'Dr. Smith',
        email: 'smith@example.com',
        undefinedField: undefined,
      };

      sanitizeVeterinarioInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        nombre: 'Dr. Smith',
        email: 'smith@example.com',
      });
    });
  });

  describe('findAll', () => {
    it('should return veterinarios for a given especie', async () => {
      mockReq.query = { especie: '1' };
      const mockVet = {
        id: 1,
        nombre: 'Dr. Smith',
        calificaciones: [{ puntuacion: 5 }, { puntuacion: 4 }],
      };
      (ORM.em.find as jest.Mock).mockResolvedValue([mockVet]);

      await findAll(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(
        Veterinario,
        { especies: { $in: [1] } },
        { populate: ['especies', 'horarios', 'calificaciones'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found matching veterinarios',
        data: [{ ...mockVet, promedio: 4.5 }],
      });
    });

    it('should return 400 if especie is not a number', async () => {
      mockReq.query = { especie: 'abc' };

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'El tipo de mascota debe ser un ID numérico válido',
      });
    });

    it('should handle errors', async () => {
      mockReq.query = { especie: '1' };
      const error = new Error('Database error');
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('findOne', () => {
    it('should return a veterinario with available horarios', async () => {
      const mockVet = {
        id: 1,
        matricula: '12345',
        nombre: 'Dr. Smith',
        apellido: 'Doe',
        direccion: '123 Main St',
        nroTelefono: '123456789',
        email: 'smith@example.com',
        especies: [{ id: 1, nombre: 'Perro' }],
        horarios: [
          { id: 1, horaInicio: '08:00:00', horaFin: '09:00:00', diaSemana: 1 },
          { id: 2, horaInicio: '09:00:00', horaFin: '10:00:00', diaSemana: 1 },
        ],
      };
      const mockTurnos = [{ horario: { id: 1 } }];
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockVet);
      (ORM.em.find as jest.Mock).mockResolvedValue(mockTurnos);

      await findOne(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(
        Veterinario,
        { id: 1 },
        { populate: ['especies', 'horarios'] }
      );
      expect(ORM.em.find).toHaveBeenCalledWith(
        Turno,
        { veterinario: 1 },
        { populate: ['horario'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found veterinario',
        data: {
          id: 1,
          matricula: '12345',
          nombre: 'Dr. Smith',
          apellido: 'Doe',
          direccion: '123 Main St',
          nroTelefono: '123456789',
          email: 'smith@example.com',
          especies: [{ id: 1, nombre: 'Perro' }],
          horariosDisponibles: [
            { id: 2, inicio: '09:00', fin: '10:00', diaSemana: 1 },
          ],
        },
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Not found');
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await findOne(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('add', () => {
    it('should create a new veterinario', async () => {
      const mockVet = { 
        id: 1, 
        nombre: 'Dr. Smith',
        horarios: { add: jest.fn() },
        especies: { add: jest.fn() },
      };
      mockReq.body.sanitizedInput = {
        matricula: '12345',
        nombre: 'Dr. Smith',
        email: 'smith@example.com',
        contrasenia: 'password',
        horarios: [{ horaInicio: '08:00', horaFin: '10:00', diaSemana: 1 }],
        especies: [1],
      };
      (ORM.em.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(null); // matricula check
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (ORM.em.create as jest.Mock).mockReturnValue(mockVet);
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 1 });
      (ORM.em.persistAndFlush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOne).toHaveBeenNthCalledWith(1, Veterinario, { email: 'smith@example.com' });
      expect(ORM.em.findOne).toHaveBeenNthCalledWith(2, Veterinario, { matricula: '12345' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Veterinario creado exitosamente',
        data: mockVet,
      });
    });

    it('should return 400 if email already exists', async () => {
      mockReq.body.sanitizedInput = { email: 'smith@example.com' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'El email ya está registrado' });
    });

    it('should return 400 if matricula already exists', async () => {
      mockReq.body.sanitizedInput = { email: 'smith@example.com', matricula: '12345' };
      (ORM.em.findOne as jest.Mock)
        .mockResolvedValueOnce(null) // email
        .mockResolvedValueOnce({ id: 1 }); // matricula

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'La matrícula ingresada ya está registrada' });
    });
  });

  describe('update', () => {
    it('should update a veterinario', async () => {
      const mockVet = { id: 1, nombre: 'Dr. Smith' };
      mockReq.params = { id: '1' };
      mockReq.body.sanitizedInput = { nombre: 'Dr. John' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockVet);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Veterinario, { id: 1 });
      expect(ORM.em.assign).toHaveBeenCalledWith(mockVet, { nombre: 'Dr. John' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'veterinario updated',
        data: mockVet,
      });
    });
  });

  describe('remove', () => {
    it('should remove a veterinario', async () => {
      const mockVet = { id: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockVet);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      await remove(mockReq as Request, mockRes as Response);

      expect(ORM.em.getReference).toHaveBeenCalledWith(Veterinario, 1);
      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockVet);
    });
  });

  describe('horariosDisponibles', () => {
    it('should return available horarios for a date', async () => {
      mockReq.params = { id: '1' };
      mockReq.query = { fecha: '2023-10-01' };
      const mockHorarios = [
        { id: 1, horaInicio: '08:00:00', horaFin: '09:00:00', diaSemana: 0 },
        { id: 2, horaInicio: '09:00:00', horaFin: '10:00:00', diaSemana: 0 },
      ];
      const mockTurnos = [{ horario: { id: 1 } }];
      (ORM.em.find as jest.Mock)
        .mockResolvedValueOnce(mockHorarios) // horarios
        .mockResolvedValueOnce(mockTurnos); // turnos

      await horariosDisponibles(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenNthCalledWith(1, Horario, {
        veterinario: 1,
        diaSemana: 0, // Sunday
      });
      expect(ORM.em.find).toHaveBeenNthCalledWith(2, Turno, {
        veterinario: 1,
        fecha: new Date('2023-10-01T00:00:00.000Z'),
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        horariosDisponibles: [
          { id: 2, inicio: '09:00', fin: '10:00', diaSemana: 0 },
        ],
      });
    });

    it('should return 400 if fecha is missing', async () => {
      mockReq.params = { id: '1' };
      mockReq.query = {};

      await horariosDisponibles(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Debe enviar la fecha' });
    });
  });
});