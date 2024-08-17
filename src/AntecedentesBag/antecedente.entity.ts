import { ObjectId } from 'mongodb'

class IdGenerator {
  private static currentId: number = 0;

  static getNextId(): number {
    return ++IdGenerator.currentId;
  }
}

export class Antecedente {
  constructor(
    public descripcion: string,
    public fecha: Date,
    public nombreMotivo: string,
    public id=(IdGenerator.getNextId()),
    public _id?: ObjectId
  ) {}
}

