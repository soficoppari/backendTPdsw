import {
  Cascade,
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  ManyToMany,
} from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Raza } from '../Raza/raza.entity.js';

@Entity()
export class Especie {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @OneToMany(() => Raza, (raza) => raza.especie, {
    cascade: [Cascade.ALL],
  })
  razas = new Collection<Raza>(this);

  @ManyToMany(() => Veterinario, (veterinario) => veterinario.especies)
  veterinarios = new Collection<Veterinario>(this);
}
