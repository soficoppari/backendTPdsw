import { Request, Response, NextFunction } from 'express';

// Mock dependencies
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

import { sanitizeEspecieInput, findAll, findOne, add, update, remove } from '../../src/Especie/especie.controller.js';
import { ORM } from '../../src/shared/db/orm.js';
import { Especie } from '../../src/Especie/especie.entity.js';

describe('Especie Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('sanitizeEspecieInput', () => {
    it('should sanitize especie input', () => {
      mockReq.body = {
        id: 1,
        nombre: 'Perro',
        extraField: 'should be ignored',
      };

      sanitizeEspecieInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'Perro',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove undefined fields', () => {
      mockReq.body = {
        id: 1,
        nombre: 'Gato',
        mascotas: undefined,
        veterinarios: undefined,
      };

      sanitizeEspecieInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'Gato',
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all especies', async () => {
      const mockEspecies = [
        { id: 1, nombre: 'Perro' },
        { id: 2, nombre: 'Gato' },
        { id: 3, nombre: 'Pajaro' },
      ];
      (ORM.em.find as jest.Mock).mockResolvedValue(mockEspecies);

      await findAll(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(Especie, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found all especies',
        data: mockEspecies,
      });
    });

    it('should return empty array if no especies', async () => {
      (ORM.em.find as jest.Mock).mockResolvedValue([]);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found all especies',
        data: [],
      });
    });

    it('should return 500 on error', async () => {
      const error = new Error('Database error');
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('findOne', () => {
    it('should return a single especie', async () => {
      const mockEspecie = { id: 1, nombre: 'Perro' };
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockEspecie);

      await findOne(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Especie, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found especie',
        data: mockEspecie,
      });
    });

    it('should return 500 if especie not found', async () => {
      const error = new Error('Especie not found');
      mockReq.params = { id: '999' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await findOne(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Especie not found' });
    });
  });

  describe('add', () => {
    it('should create a new especie', async () => {
      const mockEspecie = { id: 1, nombre: 'Hamster' };
      mockReq.body = { sanitizedInput: { nombre: 'Hamster' } };
      (ORM.em.create as jest.Mock).mockReturnValue(mockEspecie);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.create).toHaveBeenCalledWith(Especie, { nombre: 'Hamster' });
      expect(ORM.em.flush).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'especie created',
        data: mockEspecie,
      });
    });

    it('should return 500 on duplicate especie', async () => {
      const error = new Error('Duplicate especie');
      mockReq.body = { sanitizedInput: { nombre: 'Perro' } };
      (ORM.em.create as jest.Mock).mockReturnValue({});
      (ORM.em.flush as jest.Mock).mockRejectedValue(error);

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Duplicate especie' });
    });

    it('should handle empty sanitizedInput', async () => {
      const mockEspecie = { id: 2 };
      mockReq.body = { sanitizedInput: {} };
      (ORM.em.create as jest.Mock).mockReturnValue(mockEspecie);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.create).toHaveBeenCalledWith(Especie, {});
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update an especie', async () => {
      const mockEspecie = { id: 1, nombre: 'Perro' };
      mockReq.params = { id: '1' };
      mockReq.body = { sanitizedInput: { nombre: 'Perro Actualizado' } };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockEspecie);
      (ORM.em.assign as jest.Mock).mockReturnValue(undefined);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Especie, { id: 1 });
      expect(ORM.em.assign).toHaveBeenCalledWith(mockEspecie, { nombre: 'Perro Actualizado' });
      expect(ORM.em.flush).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'especie updated',
        data: mockEspecie,
      });
    });

    it('should return 500 if especie not found for update', async () => {
      const error = new Error('Especie not found');
      mockReq.params = { id: '999' };
      mockReq.body = { sanitizedInput: { nombre: 'New Name' } };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await update(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Especie not found' });
    });

    it('should handle partial updates', async () => {
      const mockEspecie = { id: 1, nombre: 'Perro' };
      mockReq.params = { id: '1' };
      mockReq.body = { sanitizedInput: { nombre: 'Perro Modificado' } };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockEspecie);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.assign).toHaveBeenCalledWith(mockEspecie, { nombre: 'Perro Modificado' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('remove', () => {
    it('should delete an especie', async () => {
      const mockEspecie = { id: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockEspecie);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      await remove(mockReq as Request, mockRes as Response);

      expect(ORM.em.getReference).toHaveBeenCalledWith(Especie, 1);
      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockEspecie);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'especie deleted' });
    });

    it('should return 500 on delete error', async () => {
      const error = new Error('Cannot delete especie');
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 1 });
      (ORM.em.removeAndFlush as jest.Mock).mockRejectedValue(error);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Cannot delete especie' });
    });
  });
});
