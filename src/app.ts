import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './Usuario/usuario.routes.js';
import { mascotaRouter } from './Mascota/mascota.routes.js';
import { veterinarioRouter } from './Veterinario/veterinario.routes.js';
import { ORM, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { especieRouter } from './Especie/especie.routes.js';
import cors from 'cors';
import { turnoRouter } from './Turno/turno.routes.js';
import { horarioRouter } from './Horario/horario.routes.js';
import { razaRouter } from './Raza/raza.routes.js';
import loginRouter from './Login/login.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // Permite el frontend en localhost:3000 (o cualquier otro que uses)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  })
);

//luego de los middlewares base
app.use((req, res, next) => RequestContext.create(ORM.em, next));
//antes de las rutas y middlewares de negocio

app.use('/api/usuario', usuarioRouter);
app.use('/api/mascota', mascotaRouter);
app.use('/api/veterinario', veterinarioRouter);
app.use('/api/especie', especieRouter);
app.use('/api/horario', horarioRouter);
app.use('/api/turno', turnoRouter);
app.use('/api/raza', razaRouter);
app.use('/api/login', loginRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

await syncSchema(); //never in production

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
