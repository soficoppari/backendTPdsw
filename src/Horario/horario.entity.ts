import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  dia!: string;

  @Property()
  horaInicio!: Date;

  @Property()
  horaFin!: Date;

  @ManyToOne(() => Veterinario, { nullable: false })
  veterinario!: Rel<Veterinario>;
}
