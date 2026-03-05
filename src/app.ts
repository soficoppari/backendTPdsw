import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './Usuario/usuario.routes.js';
import { mascotaRouter } from './Mascota/mascota.routes.js';
import { veterinarioRouter } from './Veterinario/veterinario.routes.js';
import { ORM, syncSchema } from './shared/db/orm.js';
import { seedDatabase } from './shared/db/seed.js';
import { RequestContext } from '@mikro-orm/core';
import { especieRouter } from './Especie/especie.routes.js';
import cors from 'cors';
import { turnoRouter } from './Turno/turno.routes.js';
import { horarioRouter } from './Horario/horario.routes.js';
import { razaRouter } from './Raza/raza.routes.js';
import loginRouter from './Login/login.routes.js';
import dotenv from 'dotenv';
import { calificacionRouter } from './Calificacion/calificacion.routes.js';
import { paymentRouter } from './Payment/payment.routes.js';
import { initCancellationJob } from './shared/jobs/cancellation.job.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://vetifyvet.netlify.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  })
);


//luego de los middlewares base
app.use((req, res, next) => RequestContext.create(ORM.em, next));
//antes de las rutas y middlewares de negocio

app.use('/api/usuario', usuarioRouter);
app.use('/api/calificacion', calificacionRouter);
app.use('/api/mascota', mascotaRouter);
app.use('/api/veterinario', veterinarioRouter);
app.use('/api/especie', especieRouter);
app.use('/api/horario', horarioRouter);
app.use('/api/turno', turnoRouter);
app.use('/api/raza', razaRouter);
app.use('/api/login', loginRouter);
app.use('/api/payment', paymentRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

await syncSchema();

// Sembrar Especies y Razas
await seedDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initCancellationJob();
});
