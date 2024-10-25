import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToOne,
  Rel,
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

  @ManyToOne(() => Veterinaria, { nullable: false })
  veterinaria!: Rel<Veterinaria>;
}
