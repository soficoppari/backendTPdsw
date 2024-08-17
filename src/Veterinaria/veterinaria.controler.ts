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

async function findAll(req:Request, res:Response) {
  res.json({ data: await repositoryV.findAll() });
};

async function findOne(req:Request, res:Response) {
  const id= req.params.idVeterinaria
  const veterinaria= await repositoryV.findOne({id})
  if (!veterinaria) {
     return res.status(404).send({ message: 'veterinaria not found' });
  }
    res.json({ data: veterinaria });
  }


 async  function add(req:Request, res:Response)  {
  const input = req.body.sanitizedInput;

  const newVeterinaria = new Veterinaria(
    input.idVeterinaria,
    input.contraseniaVet,
    input.nombreVet,
    input.direccion,
    input.nroTelefono,
    input.email,
    
  );

  const veterinaria= await repositoryV.add(newVeterinaria)
   return res.status(201).json({ message: 'veterinaria created', data: newVeterinaria });
};




async function update(req:Request, res:Response) {
  req.body.sanitizedInput.idVeterinaria=req.params.idVeterinaria
  const veterinaria=await repositoryV.update(req.body.sanitizedInput)

  if (!veterinaria) {
    res.status(404).send({ message: 'Veterinaria not found' });
  }
  
  return res.status(200).json({ message: 'Veterinaria updated', data: veterinaria});
}



async function remove(req:Request, res:Response)  {
  const id= req.params.idVeterinaria
  const veterinaria= await repositoryV.delete({id})
  
  if (!Veterinaria) {
    res.status(404).send({ message: 'veterinaria not found' });
  }
  res.status(200).json({ message: 'Veterinaria deleted' });
};

export {sanitizeVeterinariaInput, findAll, findOne, add, update, remove}