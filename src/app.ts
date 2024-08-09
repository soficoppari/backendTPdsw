import express, { Request, Response, NextFunction } from 'express';
import { Mascota } from './MascotasBag/mascota.entity.js';
import { Veterinaria } from './Veterinaria/veterinaria.entity.js';
import { MascotaRepository } from './MascotasBag/mascota.repository.js';
import { usuarioRouter } from './UsuarioBag/usuario.routes.js';

const app = express();
app.use(express.json());


//Date format: YYYY-MM-DD


const repositoryM= new MascotaRepository()




// Middleware para sanitizar la entrada de las mascotas

function sanitizeMascotaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    idMascota: req.body.idMascota,
    nombre: req.body.nombre,
    fechaNac: req.body.fechaNac,
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}



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


// // OBTENER TODOS LAS MASCOTAS

// app.get('/api/mascota', (req, res) => {
//   res.json({ data: repositoryM.findAll() });
// });

// // OBTENER TODAS LAS VETERINARIAS

// app.get('/api/veterinaria', (req, res) => {
//   res.json({ data: veterinaria });
// });


// // OBTENER UNA MASCOTA

// app.get('/api/mascota/:idMascota', (req, res) => {
//   const id= req.params.idMascota
//   const mascota= repositoryM.findOne({id})
//   if (!mascota) {
//     res.status(404).send({ message: 'mascota not found' });
//   } else {
//     res.json({ data: mascota });
//   }
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



// // CREAR UNA MASCOTA

// app.post('/api/mascota', sanitizeMascotaInput, (req, res) => {
//   const input = req.body.sanitizedInput;

//   const newMascota = new Mascota(
//     input.idMascota,
//     input.nombre,
//     input.fechaNac, 
//   );

//   const mascota= repositoryM.add(newMascota)
//   return res.status(201).json({ message: 'mascota created', data: newMascota });
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


// // MODIFICAR UNA MASCOTA COMPLETAMENTE

// app.put('/api/mascota/:idMascota', sanitizeMascotaInput, (req, res) => {
//   req.body.sanitizedInput.idMascota=req.params.idMascota
//   const mascota=repositoryM.update(req.body.sanitizedInput)

//   if (!mascota) {
//     res.status(404).send({ message: 'mascota not found' });
//   }
  
//   return res.status(200).json({ message: 'mascota updated', data: mascota});
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





// // MODIFICAR UNA MASCOTA PARCIALMENTE

// app.patch('/api/mascota/:idMascota', sanitizeMascotaInput, (req, res) => {
//   req.body.sanitizedInput.idMascota=req.params.idMascota
//   const mascota=repositoryM.update(req.body.sanitizedInput)

//   if (!mascota) {
//     res.status(404).send({ message: 'mascota not found' });
//   }
  
//   return res.status(200).json({ message: 'mascota updated', data: mascota});
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



// // BORRAR UNA MASCOTA

// app.delete('/api/mascota/:idMascota', (req, res) => {
//   const id= req.params.idMascota
//   const mascota= repositoryM.delete({id})
  
//   if (!mascota) {
//     res.status(404).send({ message: 'mascota not found' });
//   }
//   res.status(200).json({ message: 'mascota deleted' });
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