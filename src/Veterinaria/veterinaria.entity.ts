import { ObjectId } from 'mongodb';
import crypto from 'node:crypto'

export class Veterinaria{
  constructor(
    public _id:ObjectId,
    public contraseniaVet:string,
    public nombreVet:string,
    public direccion:string,
    public nroTelefono:number,
    public email:string,
        ){}
}