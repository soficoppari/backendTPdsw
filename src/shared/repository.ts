export interface Repository<T> {
  findAll(): T[] | undefined
  findOne(mascotas: {id: string; fechaI: Date; fechaF:Date}): T | undefined  //modificable el mascotas: id string
  add (mascotas: T): T | undefined
  update(mascotas: T): T | undefined
  delete(mascotas: {id: string; fechaI:Date ; fechaF:Date}): T | undefined
  
}