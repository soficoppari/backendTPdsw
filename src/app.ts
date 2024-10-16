import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './UsuarioBag/usuario.routes.js';
import { mascotaRouter } from './MascotasBag/mascota.routes.js';
import { veterinariaRouter } from './Veterinaria/veterinaria.routes.js';
//import { horarioRouter } from './Horario/horario.routes.js';
import { antecedenteRouter } from './AntecedentesBag/antecedente.routes.js';
import { ORM, syncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';

const app = express();
app.use(express.json());

//luego de los middlewares base
app.use((req, res, next) => RequestContext.create(ORM.em, next));
//antes de las rutas y middlewares de negocio

app.use('/api/usuarios', usuarioRouter);
app.use('/api/mascota', mascotaRouter);
app.use('/api/veterinaria', veterinariaRouter);
//app.use('/api/horarios', horarioRouter)
app.use('/api/antecedentes', antecedenteRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' });
});

await syncSchema(); //never in production

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
