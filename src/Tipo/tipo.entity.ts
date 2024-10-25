import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { Especie } from '../Especie/especie.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Veterinaria } from '../Veterinaria/veterinaria.entity.js';

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

  @ManyToMany(() => Veterinaria, (veterinaria) => veterinaria.tipos, {
    cascade: [Cascade.ALL],
  })
  veterinarias = new Collection<Veterinaria>(this); // Relación de muchos a muchos con Veterinaria
}
