import crypto from 'node:crypto'

export class Veterinaria{
  constructor(
    public idVeterinaria=crypto.randomUUID(),
    public contraseniaVet:string,
    public nombreVet:string,
    public direccion:string,
    public nroTelefono:number,
    public email:string,
        ){}
}