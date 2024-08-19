import crypto from 'node:crypto'
import { Mascota } from '../MascotasBag/mascota.entity.js';

export class Usuario{
  constructor(
    public idUsuario=crypto.randomUUID(),
    public nombre:string,
    public apellido:string,
    public email:string,
    public nroTelefono:number,
    public contraseniaUser:string,
    public mascotas:string[]
    // public mascotas:Mascota[]
        ){}
}