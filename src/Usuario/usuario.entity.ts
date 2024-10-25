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

@Entity()
export class Usuario {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property()
  email!: string;

  @Property()
  nroTelefono!: number;

  @Property()
  contraseniaUser!: string;

  @OneToMany(() => Mascota, (mascota) => mascota.usuario, {
    cascade: [Cascade.ALL],
  })
  mascotas = new Collection<Mascota>(this);

  @OneToMany(() => Turno, (turno) => turno.usuario, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this); // Relación de uno a muchos con Turnos
}
