import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

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

  //@ManyToMany(() => Mascota, (mascota) => mascota.usuarios, {
  //cascade: [Cascade.ALL],
  //owner: true,
  //})
  //mascotas!: Mascota[];
}
