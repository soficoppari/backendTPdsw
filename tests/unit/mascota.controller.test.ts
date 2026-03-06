import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/shared/db/orm.js', () => ({
  ORM: {
    em: {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      assign: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
      getReference: jest.fn(),
    },
  },
}));

import { sanitizeMascotaInput, findAll, findOne, add, update, remove } from '../../src/Mascota/mascota.controller.js';
import { ORM } from '../../src/shared/db/orm.js';
import { Mascota } from '../../src/Mascota/mascota.entity.js';
import { Usuario } from '../../src/Usuario/usuario.entity.js';
import { Raza } from '../../src/Raza/raza.entity.js';

describe('Mascota Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    // Mock process.env.JWT_SECRET
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('sanitizeMascotaInput', () => {
    it('should sanitize input and call next', () => {
      mockReq.body = {
        id: 1,
        nombre: 'Firulais',
        fechaNacimiento: '2020-01-01',
        usuarioId: 1,
        razaId: 1,
        turnos: [],
        extraField: 'should be removed',
      };

      sanitizeMascotaInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'Firulais',
        fechaNacimiento: '2020-01-01',
        usuarioId: 1,
        razaId: 1,
        turnos: [],
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove undefined properties', () => {
      mockReq.body = {
        nombre: 'Firulais',
        undefinedField: undefined,
      };

      sanitizeMascotaInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        nombre: 'Firulais',
      });
    });
  });

  describe('findAll', () => {
    it('should return mascotas for the authenticated user', async () => {
      const mockToken = 'mockToken';
      const mockDecoded = { id: 1 };
      const mockMascotas = [{ id: 1, nombre: 'Firulais' }];
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (ORM.em.find as jest.Mock).mockResolvedValue(mockMascotas);

      await findAll(mockReq as Request, mockRes as Response);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test_secret');
      expect(ORM.em.find).toHaveBeenCalledWith(
        Mascota,
        { usuario: { id: 1 } },
        { populate: ['usuario', 'raza.especie'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Mascotas encontradas',
        data: mockMascotas,
      });
    });

    it('should return 401 if no token provided', async () => {
      mockReq.headers = {};

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('should handle jwt verification errors', async () => {
      const mockToken = 'invalidToken';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        details: 'Invalid token',
      });
    });
  });

  describe('findOne', () => {
    it('should return a mascota by id', async () => {
      const mockMascota = { id: 1, nombre: 'Firulais' };
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockMascota);

      await findOne(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(
        Mascota,
        { id: 1 },
        { populate: ['usuario', 'raza'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found mascota',
        data: mockMascota,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await findOne(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('add', () => {
    it('should create a new mascota', async () => {
      const mockUsuario = { id: 1 };
      const mockRaza = { id: 1 };
      const mockMascota = { id: 1, nombre: 'Firulais' };
      mockReq.body.sanitizedInput = {
        nombre: 'Firulais',
        fechaNacimiento: '2020-01-01',
        usuarioId: 1,
        razaId: 1,
      };
      (ORM.em.findOneOrFail as jest.Mock)
        .mockResolvedValueOnce(mockUsuario) // for usuario
        .mockResolvedValueOnce(mockRaza); // for raza
      (ORM.em.create as jest.Mock).mockReturnValue(mockMascota);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenNthCalledWith(1, Usuario, { id: 1 });
      expect(ORM.em.findOneOrFail).toHaveBeenNthCalledWith(2, Raza, { id: 1 });
      expect(ORM.em.create).toHaveBeenCalledWith(Mascota, {
        nombre: 'Firulais',
        fechaNacimiento: '2020-01-01',
        usuario: mockUsuario,
        raza: mockRaza,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Mascota creada',
        data: mockMascota,
      });
    });

    it('should return 404 if usuario not found', async () => {
      const error = new Error('Not found');
      error.name = 'EntityNotFoundError';
      mockReq.body.sanitizedInput = { usuarioId: 1 };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should handle other errors', async () => {
      const error = new Error('Database error');
      mockReq.body.sanitizedInput = { usuarioId: 1 };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        details: 'Database error',
      });
    });
  });

  describe('update', () => {
    it('should update a mascota', async () => {
      const mockMascota = { id: 1, nombre: 'Firulais' };
      const mockUsuario = { id: 2 };
      const mockRaza = { id: 2 };
      mockReq.params = { id: '1' };
      mockReq.body.sanitizedInput = {
        nombre: 'Rex',
        usuarioId: 2,
        razaId: 2,
      };
      (ORM.em.findOneOrFail as jest.Mock)
        .mockResolvedValueOnce(mockMascota) // mascota
        .mockResolvedValueOnce(mockUsuario) // usuario
        .mockResolvedValueOnce(mockRaza); // raza
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenNthCalledWith(1, Mascota, { id: 1 });
      expect(ORM.em.findOneOrFail).toHaveBeenNthCalledWith(2, Usuario, { id: 2 });
      expect(ORM.em.findOneOrFail).toHaveBeenNthCalledWith(3, Raza, { id: 2 });
      expect(ORM.em.assign).toHaveBeenCalledWith(mockMascota, {
        nombre: 'Rex',
        usuarioId: 2,
        razaId: 2,
        usuario: mockUsuario,
        raza: mockRaza,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Mascota actualizada',
        data: mockMascota,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await update(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('remove', () => {
    it('should remove a mascota', async () => {
      const mockMascota = { id: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockMascota);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      await remove(mockReq as Request, mockRes as Response);

      expect(ORM.em.getReference).toHaveBeenCalledWith(Mascota, 1);
      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockMascota);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'mascota deleted' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await remove(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});