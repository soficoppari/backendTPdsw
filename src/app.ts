import express, { Request, Response, NextFunction } from 'express';
import { Veterinaria } from './Veterinaria/veterinaria.entity.js';
import { usuarioRouter } from './UsuarioBag/usuario.routes.js';
import { mascotaRouter } from './MascotasBag/mascota.routes.js';

const app = express();
app.use(express.json());


//Date format: YYYY-MM-DD


function sanitizeVeterinariaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    idVeterinaria: req.body.idVeterinaria,
    contraseniaVet: req.body.contraseniaVet,
    nombreVet: req.body.nombreVet,
    direccion: req.body.direccion,
    nroTelefono: req.body.nroTelefono,
    email: req.body.email,
    
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}



// // OBTENER TODOS LOS USUARIOS

app.use('/api/usuario', usuarioRouter)
app.use('/api/mascota', mascotaRouter)


// // OBTENER TODAS LAS VETERINARIAS

// app.get('/api/veterinaria', (req, res) => {
//   res.json({ data: veterinaria });
// });





// // OBTENER UNA VETERINARIA

// app.get('/api/veterinaria/:idVeterinaria', (req, res) => {
//   const veterinarias = veterinaria.find((c) => c.idVeterinaria === req.params.idVeterinaria);
//   if (!veterinaria) {
//     res.status(404).send({ message: 'veterinaria not found' });
//   } else {
//     res.json({ data: veterinaria });
//   }
// });


// // CREAR UNA VETERINARIA

// app.post('/api/veterinaria', sanitizeVeterinariaInput, (req, res) => {
//   const input = req.body.sanitizedInput;

//   const newVeterinaria = new Veterinaria(
//     input.idVeterinaria,
//     input.contraseniaVet,
//     input.nombreVet,
//     input.direccion,
//     input.nroTelefono,
//     input.email,
     
//   );

//   veterinaria.push(newVeterinaria);
//   res.status(201).json({ message: 'veterinaria created', data: newVeterinaria });
// });



// // MODIFICAR UN USUARIO COMPLETAMENTE

// app.put('/api/usuario/:idUsuario', sanitizeUsuarioInput, (req, res) => {
//   req.body.sanitizedInput.idUsuario=req.params.idUsuario
//   const usuario=repositoryU.update(req.body.sanitizedInput)

//   if (!usuario) {
//     res.status(404).send({ message: 'Usuario not found' });
//   }
  
//   return res.status(200).json({ message: 'Usuario updated', data: usuario});
// });



// // MODIFICAR UN VETERINARIA COMPLETAMENTE

// app.put('/api/veterinaria/:idVeterinaria', sanitizeVeterinariaInput, (req, res) => {
//   const indexC = veterinaria.findIndex((c) => c.idVeterinaria === req.params.idVeterinaria);
//   if (indexC === -1) {
//     res.status(404).send({ message: 'veterinaria not found' });
//   }

//   veterinaria[indexC] = { ...veterinaria[indexC], ...req.body.sanitizedInput };
//   res
//     .status(200)
//     .json({ message: 'Veterinaria updated', data: veterinaria[indexC] });
// });



// // MODIFICAR UNA VETERINARIA PARCIALMENTE

// app.patch('/api/veterinaria/:idVeterinaria', sanitizeVeterinariaInput, (req, res) => {
//   const indexC = veterinaria.findIndex((c) => c.idVeterinaria === req.params.idVeterinaria);
//   if (indexC === -1) {
//     res.status(404).send({ message: 'veterinaria not found' });
//   }

//   veterinaria[indexC] = { ...veterinaria[indexC], ...req.body.sanitizedInput };
//   res
//     .status(200)
//     .json({ message: 'veterinaria updated', data: veterinaria[indexC] });
// });



// // BORRAR UNA VETERINARIA

// app.delete('/api/veterinaria/:idVeterinaria', (req, res) => {
//   const indexC = veterinaria.findIndex((c) => c.idVeterinaria === req.params.idVeterinaria);
//   if (indexC === -1) {
//     res.status(404).send({ message: 'veterinaria not found' });
//   }

//   veterinaria.splice(indexC, 1);
//   res.status(200).json({ message: 'veterinaria deleted' });
// });



// LISTEN

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});