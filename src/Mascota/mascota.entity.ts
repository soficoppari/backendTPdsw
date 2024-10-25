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
import { Tipo } from '../Tipo/tipo.entity.js';
import { Turno } from '../Turno/turno.entity.js';

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

  @ManyToOne(() => Tipo, { nullable: false })
  tipo!: Rel<Tipo>;

  @OneToMany(() => Turno, (turno) => turno.mascota, {
    cascade: [Cascade.ALL],
  })
  turnos = new Collection<Turno>(this); // Relación de uno a muchos con Turnos
}
