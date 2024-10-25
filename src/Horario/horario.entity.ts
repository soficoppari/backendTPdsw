import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinaria } from '../Veterinaria/veterinaria.entity.js';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property()
  fecha_hora_ini!: Date;

  @Property()
  fecha_hora_fin!: Date;

  @ManyToOne(() => Veterinaria, { nullable: false })
  veterinaria!: Rel<Veterinaria>;
}
