import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Turno } from '../Turno/turno.entity.js';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false, type: 'time' })
  horaInicio!: string; // solo hora: "08:00"

  @Property({ nullable: false, type: 'time' })
  horaFin!: string;    // solo hora: "12:00"

  @Property({ nullable: true })
  diaSemana?: number; // 0 = domingo, 1 = lunes, etc.

  @ManyToOne(() => Veterinario, { nullable: false })
  veterinario!: Rel<Veterinario>;

  @OneToMany(() => Turno, (turno) => turno.horario)
  turnos = new Collection<Turno>(this);
}