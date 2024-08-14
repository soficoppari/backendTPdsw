import express, { Request, Response, NextFunction } from 'express';
import { usuarioRouter } from './UsuarioBag/usuario.routes.js';
import { mascotaRouter } from './MascotasBag/mascota.routes.js';
import { veterinariaRouter } from './Veterinaria/veterinaria.routes.js';
import { horarioRouter } from './Horario/horario.routes.js';


const app = express();
app.use(express.json());


// // OBTENER TODOS LOS USUARIOS

app.use('/api/usuario', usuarioRouter)
app.use('/api/mascota', mascotaRouter)
app.use('/api/veterinaria', veterinariaRouter)
app.use('/api/horarios', horarioRouter)

//

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})


// LISTEN

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});