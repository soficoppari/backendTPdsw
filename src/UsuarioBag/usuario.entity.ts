import crypto from 'node:crypto'
import { Mascota } from '../MascotasBag/mascota.entity.js';
import { ObjectId } from 'mongodb';

export class Usuario{
  constructor(
    public _id:ObjectId,
    public nombre:string,
    public apellido:string,
    public email:string,
    public nroTelefono:number,
    public contraseniaUser:string,
    public mascotas:string[]
    // public mascotas:Mascota[]
        ){}
}