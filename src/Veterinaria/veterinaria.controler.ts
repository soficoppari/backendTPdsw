import { Request,Response,NextFunction } from "express";
import { VeterinariaRepository } from "./veterinaria.repository.js";
import { Veterinaria } from "./veterinaria.entity.js";

const repositoryV= new VeterinariaRepository()


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

function findAll(req:Request, res:Response) {
  res.json({ data: repositoryV.findAll() });
};

function findOne(req:Request, res:Response) {
  const id= req.params.idVeterinaria
  const veterinaria= repositoryV.findOne({id})
  if (!veterinaria) {
     return res.status(404).send({ message: 'veterinaria not found' });
  }
    res.json({ data: veterinaria });
  }


  function add(req:Request, res:Response)  {
  const input = req.body.sanitizedInput;

  const newVeterinaria = new Veterinaria(
    input.idVeterinaria,
    input.contraseniaVet,
    input.nombreVet,
    input.direccion,
    input.nroTelefono,
    input.email,
    
  );

  const veterinaria= repositoryV.add(newVeterinaria)
   return res.status(201).json({ message: 'veterinaria created', data: newVeterinaria });
};




function update(req:Request, res:Response) {
  req.body.sanitizedInput.idVeterinaria=req.params.idVeterinaria
  const veterinaria=repositoryV.update(req.body.sanitizedInput)

  if (!veterinaria) {
    res.status(404).send({ message: 'Veterinaria not found' });
  }
  
  return res.status(200).json({ message: 'Veterinaria updated', data: veterinaria});
}



function remove(req:Request, res:Response)  {
  const id= req.params.idVeterinaria
  const veterinaria= repositoryV.delete({id})
  
  if (!Veterinaria) {
    res.status(404).send({ message: 'veterinaria not found' });
  }
  res.status(200).json({ message: 'Veterinaria deleted' });
};

export {sanitizeVeterinariaInput, findAll, findOne, add, update, remove}