import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Usuario } from '../Usuario/usuario.entity';

@Entity()
export class Mascota {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  fechaNacimiento!: string;

  //@ManyToOne(() => Usuario) // Relación de muchos a uno con Usuario
  //usuario!: Usuario;
}
