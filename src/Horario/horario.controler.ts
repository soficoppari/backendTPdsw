import { Request,Response,NextFunction } from "express";
import { HorarioRepository } from "./horario.repository.js";
import { Horario } from "./horario.entity.js";

const repositoryH= new HorarioRepository()


function sanitizeHorarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    FechaHoraIni: req.body.FechaHoraIni,
    FechaHoraFin: req.body.FechaHoraFin,
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
  res.json({ data: repositoryH.findAll() });
};



      function findOne (req: Request, res: Response) {
        const { id, fechaI, fechaF } = req.body;

        if (!fechaI || !fechaF) {
            res.status(400).json({ message: 'Both fechaI and fechaF are required' });
            return;
        }

        const horario = repositoryH.findOne({ id, fechaI: new Date(fechaI), fechaF: new Date(fechaF) });

        if (horario) {
            return res.status(200).json(horario);
        } else {
            return res.status(404).json({ message: 'Horario not found' });
        }
    };


  function add(req:Request, res:Response)  {
  const input = req.body.sanitizedInput;

  const newHorario = new Horario(
    input.FechaHoraIni,
    input.FechaHoraIni,
    
  );

  const horario= repositoryH.add(newHorario)
   return res.status(201).json({ message: 'hoario created', data: newHorario });
};



    function update (req: Request, res: Response){
        const item: Horario = req.body;

        if (!item.FechaHoraIni || !item.FechaHoraFin) {
            res.status(400).json({ message: 'FechaHoraIni and FechaHoraFin are required' });
            return;
        }

        const updatedHorario = repositoryH.update(item);

        if (updatedHorario) {
            res.status(200).json(updatedHorario);
        } else {
            res.status(404).json({ message: 'Horario not found' });
        }
    };


   function remove(req: Request, res: Response){
        const { id, fechaI, fechaF } = req.body;

        if (!fechaI || !fechaF) {
            res.status(400).json({ message: 'fechaI, and fechaF are required' });
            return;
        }

        const deletedHorario = repositoryH.delete({ id, fechaI: new Date(fechaI), fechaF: new Date(fechaF) });

        if (deletedHorario) {
            res.status(200).json(deletedHorario);
        } else {
            res.status(404).json({ message: 'Horario not found' });
        }
    };

export {sanitizeHorarioInput, findAll, findOne, add, update, remove}