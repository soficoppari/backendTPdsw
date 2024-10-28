import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';

@Entity()
export class Especie {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @OneToMany(() => Mascota, (mascota) => mascota.especie, {
    cascade: [Cascade.ALL],
  })
  mascotas = new Collection<Mascota>(this);

  @ManyToMany(() => Veterinario, (veterinario) => veterinario.especies)
  veterinarios = new Collection<Veterinario>(this);
}
