import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Especie } from '../Especie/especie.entity';
import { Mascota } from '../Mascota/mascota.entity.js';

@Entity()
export class Tipo {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @OneToMany(() => Mascota, (mascota) => mascota.tipo, {
    cascade: [Cascade.ALL],
  })
  mascotas = new Collection<Mascota>(this);

  // Relación de uno a muchos con Especie
  //@OneToMany(() => Especie, (especie) => especie.tipo)
  //especies = new Collection<Especie>(this); // Usamos Collection para representar la lista de especies
}
