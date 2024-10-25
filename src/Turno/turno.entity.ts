import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { Horario } from '../Horario/horario.entity.js';
import { Veterinaria } from '../Veterinaria/veterinaria.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';

@Entity()
export class Turno {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Horario, { nullable: false })
  horario!: Rel<Horario>;

  @Property()
  estado!: boolean;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>; // Relación directa con Usuario

  @ManyToOne(() => Mascota, { nullable: false })
  mascota!: Rel<Mascota>; // Relación directa con Mascota

  @OneToOne(() => Veterinaria, { nullable: false })
  veterinaria!: Rel<Veterinaria>;
}
