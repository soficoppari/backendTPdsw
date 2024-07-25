import express, { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.js';
import { Mascota } from './MascotasBag/mascota.entity.js';

const app = express();
app.use(express.json());

//Date format: YYYY-MM-DD

const usuario = [
  new Usuario(
     'tg56-trg4-t4hg-3rde-uj6t',
    'santino',
    'chibotta',
    'santichibotta@gmail.com',
    341,
    '341',
    ['loro','perro']
  ),
  new Usuario(
     'tg57-trg4-t4hg-3rde-uj9t',
    'octvio',
    'dobrovits',
    'octaviodobrovits@gmail.com',
    789,
    '789',
    ['gato','pez']
  ),
];

const mascota = [
  new Mascota(
    'aaaa-bbbb-masc-ota1-0000',
    'luke',
    '2020/10/09',
  )
]

// Middleware para sanitizar la entrada de los usuarios

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    idUsuario: req.body.idUsuario,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    nroTelefono: req.body.nroTelefono,
    contraseniaUser: req.body.contraseniaUser,
    mascotas: req.body.mascotas,
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

// OBTENER TODOS LOS USUARIOS

app.get('/api/usuario', (req, res) => {
  res.json({ data: usuario });
});

// OBTENER TODOS LAS MASCOTAS

app.get('/api/mascota', (req, res) => {
  res.json({ data: mascota });
});

// OBTENER UN USUARIO

app.get('/api/usuario/:idUsuario', (req, res) => {
  const usuarios = usuario.find((c) => c.idUsuario === req.params.idUsuario);
  if (!usuario) {
    res.status(404).send({ message: 'usuario not found' });
  } else {
    res.json({ data: usuario });
  }
});

// CREAR UN USUARIO

app.post('/api/usuario', sanitizeUsuarioInput, (req, res) => {
  const input = req.body.sanitizedInput;

  const newUsuario = new Usuario(
    input.idUsuario,
    input.nombre,
    input.apellido,
    input.email,
    input.nroTelefono,
    input.contraseniaUser,
    input.mascotas
  );

  usuario.push(newUsuario);
  res.status(201).json({ message: 'usuario created', data: newUsuario });
});

// MODIFICAR UN USUARIO COMPLETAMENTE

app.put('/api/usuario/:idUsuario', sanitizeUsuarioInput, (req, res) => {
  const indexC = usuario.findIndex((c) => c.idUsuario === req.params.idUsuario);
  if (indexC === -1) {
    res.status(404).send({ message: 'Usuario not found' });
  }

  usuario[indexC] = { ...usuario[indexC], ...req.body.sanitizedInput };
  res
    .status(200)
    .json({ message: 'Usuario updated', data: usuario[indexC] });
});

// MODIFICAR UN USUARIO PARCIALMENTE

app.patch('/api/usuario/:idUsuario', sanitizeUsuarioInput, (req, res) => {
  const indexC = usuario.findIndex((c) => c.idUsuario === req.params.idUsuario);
  if (indexC === -1) {
    res.status(404).send({ message: 'usuario not found' });
  }

  usuario[indexC] = { ...usuario[indexC], ...req.body.sanitizedInput };
  res
    .status(200)
    .json({ message: 'usuario updated', data: usuario[indexC] });
});

// BORRAR UN USUARIO

app.delete('/api/usuario/:idUsuario', (req, res) => {
  const indexC = usuario.findIndex((c) => c.idUsuario === req.params.idUsuario);
  if (indexC === -1) {
    res.status(404).send({ message: 'usuario not found' });
  }

  usuario.splice(indexC, 1);
  res.status(200).json({ message: 'usuario deleted' });
});

// LISTEN

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});