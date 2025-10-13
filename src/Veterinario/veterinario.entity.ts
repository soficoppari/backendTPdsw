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
import { Calificacion } from '../Calificacion/calificacion.entity.js';

@Entity()
export class Veterinario {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, unique: true })
  matricula!: number;

  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ nullable: false })
  direccion!: string;

  @Property({ nullable: false })
  nroTelefono!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false, unique: true })
  contrasenia!: string;

  @Property({ nullable: true, type: 'float' })
  promedio?: number | null; // Permitir null

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

  @OneToMany(() => Calificacion, (calificacion) => calificacion.veterinario, {
    cascade: [Cascade.ALL],
  })
  calificaciones = new Collection<Calificacion>(this);
}
