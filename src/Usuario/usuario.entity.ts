import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Mascota } from '../Mascota/mascota.entity';

@Entity()
export class Usuario {
  @PrimaryKey()
  id!: number;

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property()
  email!: string;

  @Property()
  nroTelefono!: number;

  @Property()
  contraseniaUser!: string;

  //@OneToMany(() => Mascota, (mascota) => mascota.usuario)
  //mascotas = new Collection<Mascota>(this);
}
