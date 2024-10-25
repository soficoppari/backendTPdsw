import {
  Entity,
  Property,
  PrimaryKey,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { Horario } from '../Horario/horario.entity.js';
import { Turno } from '../Turno/turno.entity.js';
import { Tipo } from '../Tipo/tipo.entity.js';

@Entity()
export class Veterinaria {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  direccion!: string;

  @Property({ nullable: false })
  nroTelefono!: number;

  @OneToMany(() => Horario, (horario) => horario.veterinaria, {
    cascade: [Cascade.ALL],
  })
  horarios = new Collection<Horario>(this); // Relación de uno a muchos con Horarios

  @OneToMany(() => Turno, (turno) => turno.veterinaria, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this);

  @OneToMany(() => Tipo, (tipo) => tipo.veterinaria, {
    cascade: [Cascade.ALL],
  })
  tipos = new Collection<Tipo>(this);
}
