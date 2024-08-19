export interface Repository<T> {
  findAll(): Promise<T[] | undefined>
  findOne(inst: {id: string; fechaI: Date; fechaF:Date}): Promise<T | undefined>  //modificable el mascotas: id string
  add (inst: T): Promise<T | undefined>
  update(id:string,inst: T): Promise<T | undefined>
  delete(inst: {id: string; fechaI:Date ; fechaF:Date}): Promise<T | undefined>
}