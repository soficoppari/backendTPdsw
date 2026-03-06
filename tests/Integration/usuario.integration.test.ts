import request from 'supertest';
import { Express } from 'express';
import express from 'express';
import { usuarioRouter } from '../../src/Usuario/usuario.routes.js';
import { ORM } from '../../src/shared/db/orm.js';
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
      persistAndFlush: jest.fn(),
      removeAndFlush: jest.fn(),
      getReference: jest.fn(),
    },
  },
}));

describe('Usuario Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/usuarios', usuarioRouter);
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('GET /usuarios', () => {
    it('should return all usuarios successfully', async () => {
      const mockUsuarios = [
        { id: 1, nombre: 'Juan', email: 'juan@example.com', mascotas: [] },
        { id: 2, nombre: 'Maria', email: 'maria@example.com', mascotas: [] },
      ];
      (ORM.em.find as jest.Mock).mockResolvedValue(mockUsuarios);

      const response = await request(app).get('/usuarios').expect(200);

      expect(response.body.message).toBe('found all usuarios');
      expect(response.body.data).toEqual(mockUsuarios);
    });

    it('should handle database error when fetching usuarios', async () => {
      const error = new Error('Database connection failed');
      (ORM.em.find as jest.Mock).mockRejectedValue(error);

      const response = await request(app).get('/usuarios').expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });

    it('should return empty array if no usuarios exist', async () => {
      (ORM.em.find as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/usuarios').expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('should return a single usuario successfully', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
        mascotas: [],
      };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);

      const response = await request(app).get('/usuarios/1').expect(200);

      expect(response.body.message).toBe('found usuario');
      expect(response.body.data).toEqual(mockUsuario);
    });

    it('should return 404 when usuario not found', async () => {
      const error = new Error('EntityNotFound');
      (error as any).name = 'EntityNotFound';
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      const response = await request(app).get('/usuarios/999').expect(404);

      expect(response.body.message).toBe('Usuario no encontrado');
    });

    it('should return 500 on database error', async () => {
      const error = new Error('Database error');
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      const response = await request(app).get('/usuarios/1').expect(500);

      expect(response.body.message).toBe('Database error');
    });

    it('should handle invalid usuario ID format', async () => {
      // This tests that parseInt handles non-numeric IDs
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue({
        id: NaN,
      });

      const response = await request(app).get('/usuarios/invalid').expect(200);

      expect(ORM.em.findOneOrFail).toHaveBeenCalled();
    });
  });

  describe('POST /usuarios', () => {
    it('should create a new usuario successfully', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@example.com',
        nroTelefono: '1234567890',
        mascotas: [],
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (ORM.em.create as jest.Mock).mockReturnValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/usuarios')
        .send({
          nombre: 'Juan',
          apellido: 'Perez',
          email: 'juan@example.com',
          nroTelefono: '1234567890',
          contrasenia: 'password123',
        })
        .expect(201);

      expect(response.body.message).toBe('Usuario created');
      expect(response.body.data).toEqual(mockUsuario);
    });

    it('should return 400 when email already exists', async () => {
      const existingUsuario = {
        id: 1,
        email: 'juan@example.com',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(existingUsuario);

      const response = await request(app)
        .post('/usuarios')
        .send({
          nombre: 'Juan',
          email: 'juan@example.com',
          contrasenia: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should handle database error during usuario creation', async () => {
      const error = new Error('Database error');
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (ORM.em.create as jest.Mock).mockReturnValue({});
      (ORM.em.flush as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/usuarios')
        .send({
          nombre: 'Juan',
          email: 'juan@example.com',
          contrasenia: 'password123',
        })
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });

    it('should hash password before storing', async () => {
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (ORM.em.create as jest.Mock).mockReturnValue({
        id: 1,
        email: 'test@example.com',
      });
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await request(app)
        .post('/usuarios')
        .send({
          nombre: 'Test',
          email: 'test@example.com',
          contrasenia: 'password123',
        })
        .expect(201);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should sanitize input before creation', async () => {
      const mockUsuario = { id: 1, email: 'test@example.com' };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (ORM.em.create as jest.Mock).mockReturnValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/usuarios')
        .send({
          nombre: 'Test',
          email: 'test@example.com',
          contrasenia: 'password123',
          extraField: 'should be ignored',
          maliciousField: '<script>alert("xss")</script>',
        })
        .expect(201);

      // Verify that only sanitized fields were used
      const createCall = (ORM.em.create as jest.Mock).mock.calls[0];
      expect(createCall[1]).not.toHaveProperty('extraField');
      expect(createCall[1]).not.toHaveProperty('maliciousField');
    });
  });

  describe('POST /usuarios/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUsuario = {
        id: 1,
        email: 'juan@example.com',
        contrasenia: 'hashed_password',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('valid_token');

      const response = await request(app)
        .post('/usuarios/login')
        .send({
          email: 'juan@example.com',
          contrasenia: 'password123',
        })
        .expect(200);

      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.data.token).toBe('valid_token');
      expect(response.body.data.usuarioId).toBe(1);
    });

    it('should return 400 when usuario not found', async () => {
      (ORM.em.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/usuarios/login')
        .send({
          email: 'nonexistent@example.com',
          contrasenia: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBe('Usuario no encontrado');
    });

    it('should return 400 when password is incorrect', async () => {
      const mockUsuario = {
        id: 1,
        email: 'juan@example.com',
        contrasenia: 'hashed_password',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/usuarios/login')
        .send({
          email: 'juan@example.com',
          contrasenia: 'wrong_password',
        })
        .expect(400);

      expect(response.body.message).toBe('Contraseña incorrecta');
    });

    it('should handle database error during login', async () => {
      const error = new Error('Database error');
      (ORM.em.findOne as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/usuarios/login')
        .send({
          email: 'juan@example.com',
          contrasenia: 'password123',
        })
        .expect(500);

      expect(response.body.message).toBe('Error interno del servidor');
    });

    it('should generate valid JWT token', async () => {
      const mockUsuario = {
        id: 1,
        email: 'juan@example.com',
        contrasenia: 'hashed_password',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('jwt_token');

      await request(app)
        .post('/usuarios/login')
        .send({
          email: 'juan@example.com',
          contrasenia: 'password123',
        })
        .expect(200);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: 'juan@example.com' },
        'tu_clave_secreta',
        { expiresIn: '1h' }
      );
    });
  });

  describe('PUT /usuarios/:id', () => {
    it('should update usuario successfully', async () => {
      const mockUsuario = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@example.com',
      };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);
      (ORM.em.assign as jest.Mock).mockReturnValue(undefined);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .put('/usuarios/1')
        .send({
          nombre: 'Juan Updated',
          email: 'juan_updated@example.com',
        })
        .expect(200);

      expect(response.body.message).toBe('usuario updated');
      expect(ORM.em.assign).toHaveBeenCalled();
    });

    it('should return 500 when usuario not found for update', async () => {
      const error = new Error('Usuario not found');
      (ORM.em.findOneOrFail as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .put('/usuarios/999')
        .send({
          nombre: 'Updated',
        })
        .expect(500);

      expect(response.body.message).toBe('Usuario not found');
    });

    it('should handle database error during update', async () => {
      const mockUsuario = { id: 1, nombre: 'Juan' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const response = await request(app)
        .put('/usuarios/1')
        .send({
          nombre: 'Updated',
        })
        .expect(500);

      expect(response.body.message).toBe('Update failed');
    });

    it('should sanitize input before updating', async () => {
      const mockUsuario = { id: 1, nombre: 'Juan' };
      (ORM.em.findOneOrFail as jest.Mock).mockResolvedValue(mockUsuario);
      (ORM.em.flush as jest.Mock).mockResolvedValue(undefined);

      await request(app)
        .put('/usuarios/1')
        .send({
          nombre: 'Updated',
          maliciousField: 'should be ignored',
        })
        .expect(200);

      const assignCall = (ORM.em.assign as jest.Mock).mock.calls[0];
      expect(assignCall[1]).not.toHaveProperty('maliciousField');
    });
  });

  describe('DELETE /usuarios/:id', () => {
    it('should delete usuario successfully', async () => {
      const mockUsuario = { id: 1 };
      (ORM.em.getReference as jest.Mock).mockReturnValue(mockUsuario);
      (ORM.em.removeAndFlush as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/usuarios/1')
        .send({})
        .expect(200);

      expect(ORM.em.removeAndFlush).toHaveBeenCalledWith(mockUsuario);
      expect(response.body.message).toBe('usuario deleted');
    });

    it('should handle database error during deletion', async () => {
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 1 });
      (ORM.em.removeAndFlush as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const response = await request(app)
        .delete('/usuarios/1')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Delete failed');
    });

    it('should handle deletion of non-existent usuario', async () => {
      (ORM.em.getReference as jest.Mock).mockReturnValue({ id: 999 });
      (ORM.em.removeAndFlush as jest.Mock).mockRejectedValue(
        new Error('Usuario not found')
      );

      const response = await request(app)
        .delete('/usuarios/999')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Usuario not found');
    });
  });

  describe('Integration edge cases', () => {
    it('should handle POST /usuarios/login route separately from POST /usuarios', async () => {
      const mockUsuario = {
        id: 1,
        email: 'test@example.com',
        contrasenia: 'hashed',
      };
      (ORM.em.findOne as jest.Mock).mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const response = await request(app)
        .post('/usuarios/login')
        .send({
          email: 'test@example.com',
          contrasenia: 'password',
        })
        .expect(200);

      expect(response.body.message).toBe('Login exitoso');
    });

    it('should preserve estado in concurrent requests', async () => {
      const usuarios = [
        { id: 1, nombre: 'User1', email: 'user1@example.com' },
        { id: 2, nombre: 'User2', email: 'user2@example.com' },
      ];

      (ORM.em.find as jest.Mock)
        .mockResolvedValueOnce([usuarios[0]])
        .mockResolvedValueOnce([usuarios[1]]);

      const [response1, response2] = await Promise.all([
        request(app).get('/usuarios'),
        request(app).get('/usuarios'),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });
});
