import {
  Entity,
  Property,
  PrimaryKey,
  OneToMany,
  Collection,
  Cascade,
  ManyToMany,
} from '@mikro-orm/core';
import { Turno } from '../Turno/turno.entity.js';
import { Especie } from '../Especie/especie.entity.js';
import { Horario } from '../Horario/horario.entity.js';

@Entity()
export class Veterinario {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, unique: true })
  matricula!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  direccion!: string;

  @OneToMany(() => Horario, (horario) => horario.veterinario, {
    cascade: [Cascade.ALL],
  })
  horarios = new Collection<Horario>(this);

  @OneToMany(() => Turno, (turno) => turno.veterinario, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this);

  @ManyToMany(() => Especie, (especie) => especie.veterinarios, { owner: true })
  especies = new Collection<Especie>(this);
}
