import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinaria } from '../Veterinaria/veterinaria.entity.js';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property()
  fechaHoraInicio!: Date;

  @Property()
  fechaHoraFin!: Date;

  @ManyToOne(() => Veterinaria, { nullable: false })
  veterinaria!: Rel<Veterinaria>;
}
