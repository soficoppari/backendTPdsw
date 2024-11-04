import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property({ nullable: false })
  dia!: string;

  @Property()
  horaInicio!: string;

  @Property()
  horaFin!: string;

  @ManyToOne(() => Veterinario, { nullable: false })
  veterinario!: Rel<Veterinario>;
}
