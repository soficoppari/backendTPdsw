import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Tipo } from '../Tipo/tipo.entity';

@Entity()
export class Especie {
  @PrimaryKey()
  id!: number;

  @Property()
  nombreEspecie!: string;

  @Property()
  descripcion!: string;

  //@ManyToOne(() => Tipo) // Relación de muchos a uno con Tipo
  //tipo!: Tipo;
}
