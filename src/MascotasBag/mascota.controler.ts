import { Request,Response,NextFunction } from "express";
import { MascotaRepository } from "./mascota.repository.js";
import { Mascota } from "./mascota.entity.js";



const repositoryM= new MascotaRepository()


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

function findAll(req:Request, res:Response) {
  res.json({ data: repositoryM.findAll() });
};

function findOne(req:Request, res:Response) {
  const id= req.params.idMascota
  const mascota= repositoryM.findOne({id})
  if (!mascota) {
     return res.status(404).send({ message: 'mascota not found' });
  }
    res.json({ data: mascota });
  }


  function add(req:Request, res:Response)  {
  const input = req.body.sanitizedInput;

  const newMascota = new Mascota(
    input.idMascota,
    input.nombre,
    input.fechaNac,
  );

    // const mascota= repositoryM.add(newMascota)
   return res.status(201).json({ message: 'mascota created', data: newMascota });
};



function update(req:Request, res:Response) {
  req.body.sanitizedInput.idMascota=req.params.idMascota
  const mascota=repositoryM.update(req.body.sanitizedInput)

  if (!mascota) {
    res.status(404).send({ message: 'Mascota not found' });
  }
  
  return res.status(200).json({ message: 'Mascota updated', data: mascota});
}



function remove(req:Request, res:Response)  {
  const id= req.params.idMascota
  const mascota= repositoryM.delete({id})
  
  if (!mascota) {
    res.status(404).send({ message: 'mascota not found' });
  }
  res.status(200).json({ message: 'mascota deleted' });
};

export {sanitizeMascotaInput, findAll, findOne, add, update, remove}