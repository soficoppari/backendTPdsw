export interface Repository<T> {
  findAll(): Promise<T[] | undefined>
  findOne(mascotas: {id: string; fechaI: Date; fechaF:Date}): Promise<T | undefined>  //modificable el mascotas: id string
  add (mascotas: T): Promise<T | undefined>
  update(mascotas: T): Promise<T | undefined>
  delete(mascotas: {id: string; fechaI:Date ; fechaF:Date}): Promise<T | undefined>
  
}