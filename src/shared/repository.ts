export interface Repository<T> {
  findAll(): T[] | undefined
  findOne(mascotas: {id: string}): T | undefined  //modificable el mascotas: id string
  add (mascotas: T): T | undefined
  update(mascotas: {id: string}): T | undefined
}