import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Usuario } from '../Usuario/usuario.entity.js';

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
}
