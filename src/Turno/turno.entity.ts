import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';
import { EstadoTurno } from './turno.enum.js';
import { Calificacion } from '../Calificacion/calificacion.entity.js';
import { Horario } from '../Horario/horario.entity.js';

@Entity()
export class Turno {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, type: 'date' })
  fecha!: Date;

  @Property({ nullable: false })
  estado: EstadoTurno = EstadoTurno.AGENDADO;

  @Property({ nullable: true })
  observaciones?: string;

  @OneToOne(() => Calificacion, { nullable: true })
  calificacion?: Rel<Calificacion>;

  @ManyToOne(() => Mascota, { nullable: false })
  mascota?: Rel<Mascota>;

  @ManyToOne(() => Veterinario, { nullable: false })
  veterinario!: Rel<Veterinario>;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario?: Rel<Usuario>;

  @ManyToOne(() => Horario, { nullable: false })
  horario!: Rel<Horario>; // vincula directamente al horario
}
