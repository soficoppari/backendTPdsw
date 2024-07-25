import crypto from 'node:crypto'

export class Mascota{
  constructor(
    public idMascota=crypto.randomUUID(),
    public nombre:string,
    public fechaNac: string //o date no se
    //puede faltar el tipo
        ){}
}