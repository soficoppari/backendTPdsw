import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
  Rel,
  ManyToMany,
} from '@mikro-orm/core';
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

  @ManyToMany(() => Veterinaria, (veterinaria) => veterinaria.tipos)
  veterinarias = new Collection<Veterinaria>(this);
}
