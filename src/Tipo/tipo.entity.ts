import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Especie } from '../Especie/especie.entity';

@Entity()
export class Tipo {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  descripcion!: string;

  // Relación de uno a muchos con Especie
  //@OneToMany(() => Especie, (especie) => especie.tipo)
  //especies = new Collection<Especie>(this); // Usamos Collection para representar la lista de especies
}
