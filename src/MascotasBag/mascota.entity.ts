import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
//import { Usuario } from '../UsuarioBag/usuario.entity';

@Entity()
export class Mascota {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  fechaNacimiento!: string;

  //@ManyToMany(() => Usuario, (usuario) => usuario.mascotas)
  //usuarios = new Collection<Usuario>(this);
}
