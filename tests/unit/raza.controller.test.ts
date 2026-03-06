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

import {
  sanitizeRazaInput,
  findRazasByEspecie,
  findAll,
  findOne,
  add,
  update,
  remove,
} from '../../src/Raza/raza.controller.js';
import { ORM } from '../../src/shared/db/orm.js';
import { Raza } from '../../src/Raza/raza.entity.js';
import { Especie } from '../../src/Especie/especie.entity.js';

describe('Raza Controller', () => {
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

  describe('sanitizeRazaInput', () => {
    it('should sanitize raza input', () => {
      mockReq.body = {
        id: 1,
        nombre: 'Labrador',
        especieId: 1,
        extraField: 'should be ignored',
      };

      sanitizeRazaInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'Labrador',
        especieId: 1,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should remove undefined fields', () => {
      mockReq.body = {
        id: 1,
        nombre: 'Poodle',
        mascotas: undefined,
        especieId: 1,
      };

      sanitizeRazaInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).toEqual({
        id: 1,
        nombre: 'Poodle',
        especieId: 1,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty mascotas field', () => {
      mockReq.body = {
        nombre: 'Bulldog',
        especieId: 1,
        mascotas: undefined,
      };

      sanitizeRazaInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.sanitizedInput).not.toHaveProperty('mascotas');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all razas', async () => {
      const mockRazas = [
        { id: 1, nombre: 'Labrador', especieId: 1 },
        { id: 2, nombre: 'Poodle', especieId: 1 },
        { id: 3, nombre: 'Siames', especieId: 2 },
      ];
      (ORM.em.find as jest.Mock).mockResolvedValue(mockRazas);

      await findAll(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(Raza, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found all razas',
        data: mockRazas,
      });
    });

    it('should return empty array if no razas', async () => {
      (ORM.em.find as jest.Mock).mockResolvedValue([]);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found all razas',
        data: [],
      });
    });

    it('should return 500 on database error', async () => {
      const error = new Error('Database connection failed');
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      await findAll(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
    });
  });

  describe('findRazasByEspecie', () => {
    it('should return razas filtered by especie', async () => {
      const mockRazas = [
        { id: 1, nombre: 'Labrador', especie: { id: 1, nombre: 'Perro' } },
        { id: 2, nombre: 'Poodle', especie: { id: 1, nombre: 'Perro' } },
      ];
      mockReq.params = { especieId: '1' };
      (ORM.em.find as jest.Mock).mockResolvedValue(mockRazas);

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(
        Raza,
        { especie: 1 },
        { populate: ['especie'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found razas',
        data: mockRazas,
      });
    });

    it('should return empty array if no razas for especie', async () => {
      mockReq.params = { especieId: '999' };
      (ORM.em.find as jest.Mock).mockResolvedValue([]);

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found razas',
        data: [],
      });
    });

    it('should return 400 if especieId is invalid', async () => {
      mockReq.params = { especieId: 'invalid' };

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid especieId' });
    });

    it('should return 400 if especieId is NaN', async () => {
      mockReq.params = { especieId: 'notanumber' };

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid especieId' });
    });

    it('should return 500 on database error', async () => {
      const error = new Error('Database error');
      mockReq.params = { especieId: '1' };
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should handle zero especieId', async () => {
      const mockRazas: any[] = [];
      mockReq.params = { especieId: '0' };
      (ORM.em.find as jest.Mock).mockResolvedValue(mockRazas);

      await findRazasByEspecie(mockReq as Request, mockRes as Response);

      expect(ORM.em.find).toHaveBeenCalledWith(
        Raza,
        { especie: 0 },
        { populate: ['especie'] }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findOne', () => {
    it('should return a single raza', async () => {
      const mockRaza = { id: 1, nombre: 'Labrador', especieId: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockRaza);

      await findOne(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Raza, { id: 1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'found raza',
        data: mockRaza,
      });
    });

    it('should return 500 if raza not found', async () => {
      const error = new Error('Raza not found');
      mockReq.params = { id: '999' };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await findOne(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Raza not found' });
    });
  });

  describe('add', () => {
    it('should create a new raza', async () => {
      const mockRaza = { id: 1, nombre: 'German Shepherd', especieId: 1 };
      mockReq.body = { sanitizedInput: { nombre: 'German Shepherd', especieId: 1 } };
      (ORM.em.create as jest.Mock).mockReturnValue(mockRaza);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.create).toHaveBeenCalledWith(Raza, {
        nombre: 'German Shepherd',
        especieId: 1,
      });
      expect(ORM.em.flush).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'raza created',
        data: mockRaza,
      });
    });

    it('should return 500 on duplicate raza', async () => {
      const error = new Error('Duplicate raza');
      mockReq.body = { sanitizedInput: { nombre: 'Labrador', especieId: 1 } };
      (ORM.em.create as jest.Mock).mockReturnValue({});
      (ORM.em.flush as jest.Mock).mockRejectedValue(error);

      await add(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Duplicate raza' });
    });

    it('should handle empty sanitizedInput', async () => {
      const mockRaza = { id: 5 };
      mockReq.body = { sanitizedInput: {} };
      (ORM.em.create as jest.Mock).mockReturnValue(mockRaza);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.create).toHaveBeenCalledWith(Raza, {});
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should create raza with only nombre', async () => {
      const mockRaza = { id: 2, nombre: 'Gato' };
      mockReq.body = { sanitizedInput: { nombre: 'Gato' } };
      (ORM.em.create as jest.Mock).mockReturnValue(mockRaza);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await add(mockReq as Request, mockRes as Response);

      expect(ORM.em.create).toHaveBeenCalledWith(Raza, { nombre: 'Gato' });
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('update', () => {
    it('should update a raza', async () => {
      const mockRaza = { id: 1, nombre: 'Labrador' };
      mockReq.params = { id: '1' };
      mockReq.body = { sanitizedInput: { nombre: 'Golden Retriever' } };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockRaza);
      (ORM.em.assign as jest.Mock).mockReturnValue(undefined);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.findOneOrFail).toHaveBeenCalledWith(Raza, { id: 1 });
      expect(ORM.em.assign).toHaveBeenCalledWith(mockRaza, { nombre: 'Golden Retriever' });
      expect(ORM.em.flush).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'raza updated',
        data: mockRaza,
      });
    });

    it('should return 500 if raza not found for update', async () => {
      const error = new Error('Raza not found');
      mockReq.params = { id: '999' };
      mockReq.body = { sanitizedInput: { nombre: 'Unknown' } };
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      await update(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Raza not found' });
    });

    it('should handle partial updates', async () => {
      const mockRaza = { id: 1, nombre: 'Poodle', especieId: 1 };
      mockReq.params = { id: '1' };
      mockReq.body = { sanitizedInput: { nombre: 'Standard Poodle' } };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockRaza);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await update(mockReq as Request, mockRes as Response);

      expect(ORM.em.assign).toHaveBeenCalledWith(mockRaza, { nombre: 'Standard Poodle' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle database error during update', async () => {
      const error = new Error('Update failed');
      mockReq.params = { id: '1' };
      mockReq.body = { sanitizedInput: { nombre: 'New Name' } };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue({ id: 1 });
      (ORM.em.flush as jest.Mock).mockRejectedValue(error);

      await update(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Update failed' });
    });
  });

  describe('remove', () => {
    it('should delete a raza', async () => {
      const mockRaza = { id: 1 };
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockRaza);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      await remove(mockReq as Request, mockRes as Response);

      expect(ORM.em.getReference).toHaveBeenCalledWith(Raza, 1);
      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockRaza);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'raza deleted' });
    });

    it('should return 500 on delete error', async () => {
      const error = new Error('Cannot delete raza with associated mascotas');
      mockReq.params = { id: '1' };
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 1 });
      (ORM.em.removeAndFlush as jest.Mock).mockRejectedValue(error);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Cannot delete raza with associated mascotas',
      });
    });

    it('should handle delete of non-existent raza', async () => {
      const error = new Error('Raza not found');
      mockReq.params = { id: '999' };
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 999 });
      (ORM.em.removeAndFlush as jest.Mock).mockRejectedValue(error);

      await remove(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Raza not found' });
    });
  });
});
