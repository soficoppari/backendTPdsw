import { Request,Response,NextFunction } from "express";
import { UsuarioRepository } from "./usuario.repository.js";
import { Usuario } from "./usuario.entity.js";

const repositoryU= new UsuarioRepository()


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

function findAll(req:Request, res:Response) {
  res.json({ data: repositoryU.findAll() });
};

function findOne(req:Request, res:Response) {
  const id= req.params.idUsuario
  const usuario= repositoryU.findOne({id})
  if (!usuario) {
     return res.status(404).send({ message: 'usuario not found' });
  }
    res.json({ data: usuario });
  }


  function add(req:Request, res:Response)  {
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

  // const usuario= repositoryU.add(newUsuario)
   return res.status(201).json({ message: 'usuario created', data: newUsuario });
};




function update(req:Request, res:Response) {
  req.body.sanitizedInput.idUsuario=req.params.idUsuario
  const usuario=repositoryU.update(req.body.sanitizedInput)

  if (!usuario) {
    res.status(404).send({ message: 'Usuario not found' });
  }
  
  return res.status(200).json({ message: 'Usuario updated', data: usuario});
}



function remove(req:Request, res:Response)  {
  const id= req.params.idUsuario
  const usuario= repositoryU.delete({id})
  
  if (!usuario) {
    res.status(404).send({ message: 'usuario not found' });
  }
  res.status(200).json({ message: 'usuario deleted' });
};

export {sanitizeUsuarioInput, findAll, findOne, add, update, remove}