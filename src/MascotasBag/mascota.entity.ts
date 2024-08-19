import { ObjectId } from 'mongodb';
import crypto from 'node:crypto'

export class Mascota{
  constructor(
    public _id:ObjectId,
    public nombre:string,
    public fechaNac: string //o date no se
    //puede faltar el tipo
        ){}
}