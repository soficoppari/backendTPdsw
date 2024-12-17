import { Request, Response, NextFunction } from 'express';
import { ORM } from '../shared/db/orm.js';
import { Raza } from './raza.entity.js';
import { Especie } from '../Especie/especie.entity.js';

const em = ORM.em;

function sanitizeRazaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre,
    mascotas: req.body.mascotas,
    especieId: req.body.especieId,
  };

  // Eliminar propiedades indefinidas
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const razas = await em.find(Raza, {});
    res.status(200).json({ message: 'found all razas', data: razas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findRazasByEspecie(req: Request, res: Response) {
  try {
    const especieId = Number(req.params.especieId); // Asegúrate de que es un número válido
    if (isNaN(especieId)) {
      return res.status(400).json({ message: 'Invalid especieId' });
    }
    console.log('Valor de especieId recibido:', especieId);

    const razas = await em.find(
      Raza,
      { especie: especieId }, // Filtrar por la especie seleccionada
      { populate: ['especie'] }
    );

    res.status(200).json({ message: 'found razas', data: razas });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const raza = await em.findOneOrFail(Raza, { id });
    res.status(200).json({ message: 'found raza', data: raza });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const raza = em.create(Raza, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'raza created', data: raza });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const razaToUpdate = await em.findOneOrFail(Raza, { id });
    em.assign(razaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'raza updated', data: razaToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const raza = em.getReference(Raza, id);
    await em.removeAndFlush(raza);
    res.status(200).json({ message: 'raza deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeRazaInput,
  findRazasByEspecie,
  findAll,
  findOne,
  add,
  update,
  remove,
};
