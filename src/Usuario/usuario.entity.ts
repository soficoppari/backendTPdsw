import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Turno } from '../Turno/turno.entity.js';
import { Calificacion } from '../Calificacion/calificacion.entity.js';

@Entity()
export class Usuario {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property()
  nroTelefono!: number;

  @Property({ nullable: false, unique: true })
  contrasenia!: string;

  @OneToMany(() => Mascota, (mascota) => mascota.usuario, {
    cascade: [Cascade.ALL],
  })
  mascotas = new Collection<Mascota>(this);

  @OneToMany(() => Turno, (turno) => turno.usuario, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this);

  @OneToMany(() => Calificacion, (calificacion) => calificacion.usuario, {
    cascade: [Cascade.ALL],
  })
  calificaciones = new Collection<Calificacion>(this); // Reseñas creadas por el usuario.
}
