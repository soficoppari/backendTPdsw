import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './Usuario/usuario.routes.js';
import { mascotaRouter } from './Mascota/mascota.routes.js';
import { veterinariaRouter } from './Veterinaria/veterinaria.routes.js';
import { horarioRouter } from './Horario/horario.routes.js';
import { antecedenteRouter } from './Antecedente/antecedente.routes.js';
import { ORM, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { tipoRouter } from './Tipo/tipo.routes.js';
import cors from 'cors';

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
app.use('/api/veterinaria', veterinariaRouter);
app.use('/api/horarios', horarioRouter);
app.use('/api/antecedente', antecedenteRouter);
app.use('/api/tipo', tipoRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

await syncSchema(); //never in production

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

//pera
