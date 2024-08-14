import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './UsuarioBag/usuario.routes.js';
import { mascotaRouter } from './MascotasBag/mascota.routes.js';
import { horarioRouter } from './Horario/horario.routes.js';
import { veterinariaRouter } from './Veterinaria/veterinaria.routes.js';

const app = express();
app.use(express.json());


app.use('/api/usuario', usuarioRouter)
app.use('/api/mascota', mascotaRouter)
app.use('/api/horario', horarioRouter)
app.use('/api/veterinaria', veterinariaRouter)



// LISTEN

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});