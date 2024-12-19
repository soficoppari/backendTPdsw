import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { Usuario } from '../Usuario/usuario.entity.js';
import { Turno } from '../Turno/turno.entity.js';
import { Raza } from '../Raza/raza.entity.js';
import { Calificacion } from '../Calificacion/calificacion.entity.js';

@Entity()
export class Mascota {
  @PrimaryKey()
  id!: number;
  @Property()
  nombre!: string;

  @Property()
  fechaNacimiento!: string;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>;

  @ManyToOne(() => Raza, { nullable: false })
  raza!: Rel<Raza>;

  @OneToMany(() => Turno, (turno) => turno.mascota, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this); // Relación de uno a muchos con Turnos
}
