import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
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

import { sanitizeUsuarioInput, findAll, findOne, add, login, update, remove } from '../../src/Usuario/usuario.controller.js';
import { ORM } from '../../src/shared/db/orm.js';
import { Usuario } from '../../src/Usuario/usuario.entity.js';

describe('Usuario Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('sanitizeUsuarioInput', () => {
    it('should sanitize input and call next', () => {
      mockReq.body = {
        id: 1,
        nombre: 'John',
        apellido: 'Doe',
        email: 'john@example.com',
        nroTelefono: '123456789',
        contrasenia: 'password',
        mascotas: [],
        turnos: [],
        calificaciones: [],
        extraField: 'should be removed',
      };

      sanitizeUsuarioInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'John',
        apellido: 'Doe',
        email: 'john@example.com',
        nroTelefono: '123456789',
        contrasenia: 'password',
        mascotas: [],
        turnos: [],
        calificaciones: [],
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove undefined properties', () => {
      mockReq.body = {
        nombre: 'John',
        email: 'john@example.com',
        undefinedField: undefined,
      };

      sanitizeUsuarioInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        nombre: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('findAll', () => {
    it('should return all usuarios', async () => {
      const mockUsuarios = [{ id: 1, nombre: 'John' }];
      (ORM.em.find as jest.Mock).mockResolvedValue(mockUsuarios);

      await findAll(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(Usuario, {}, { populate: ['mascotas'] });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found all usuarios',
        data: mockUsuarios,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('findOne', () => {
    it('should return a usuario by id', async () => {
      const mockUsuario = { id: 1, nombre: 'John' };
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);

      await findOne(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(
        Usuario,
        { id: 1 },
        { populate: ['mascotas'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found usuario',
        data: mockUsuario,
      });
    });

    it('should return 404 if usuario not found', async () => {
      const error = new Error('Not found');
      error.name = 'EntityNotFound';
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await findOne(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });
  });

  describe('add', () => {
    it('should create a new usuario', async () => {
      const mockUsuario = { id: 1, nombre: 'John', email: 'john@example.com' };
      mockReq.body.sanitizedInput = {
        nombre: 'John',
        email: 'john@example.com',
        contrasenia: 'password',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (ORM.em.create as jest.Mock).mockReturnValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOne).toHaveBeenCalledWith(Usuario, { email: 'john@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(ORM.em.create).toHaveBeenCalledWith(Usuario, {
        nombre: 'John',
        email: 'john@example.com',
        contrasenia: 'hashedPassword',
        mascotas: [],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario created',
        data: mockUsuario,
      });
    });

    it('should return 400 if email already exists', async () => {
      mockReq.body.sanitizedInput = { email: 'john@example.com' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUsuario = {
        id: 1,
        email: 'john@example.com',
        contrasenia: 'hashedPassword',
      };
      mockReq.body = { email: 'john@example.com', contrasenia: 'password' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await login(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOne).toHaveBeenCalledWith(Usuario, { email: 'john@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'john@example.com' },
        'tu_clave_secreta',
        { expiresIn: '1h' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login exitoso',
        data: {
          email: 'john@example.com',
          token: 'mockToken',
          usuarioId: 1,
        },
      });
    });

    it('should return 400 if user not found', async () => {
      mockReq.body = { email: 'john@example.com', contrasenia: 'password' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return 400 if password is incorrect', async () => {
      const mockUsuario = { contrasenia: 'hashedPassword' };
      mockReq.body = { email: 'john@example.com', contrasenia: 'wrongpassword' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Contraseña incorrecta' });
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      const mockUsuario = { id: 1, nombre: 'John' };
      mockReq.params = { id: '1' };
      mockReq.body.sanitizedInput = { nombre: 'Jane' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Usuario, { id: 1 });
      expect(ORM.em.assign).toHaveBeenCalledWith(mockUsuario, { nombre: 'Jane' });
      expect(ORM.em.flush).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'usuario updated',
        data: mockUsuario,
      });
    });
  });

  describe('remove', () => {
    it('should remove a usuario', async () => {
      const mockUsuario = { id: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockUsuario);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      await remove(mockReq as Request, mockRes as Response);

      expect(ORM.em.getReference).toHaveBeenCalledWith(Usuario, 1);
      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockUsuario);
    });
  });
});