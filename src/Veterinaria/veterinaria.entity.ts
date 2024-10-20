import {
  Entity,
  Property,
  ManyToMany,
  Cascade,
  ManyToOne,
  PrimaryKey,
} from '@mikro-orm/core';

@Entity()
export class Veterinaria {
  @PrimaryKey({ nullable: false })
  id!: number;

  @Property({ nullable: false })
  contraseniaVet!: string;

  @Property({ nullable: false })
  nombreVet!: string;

  @Property({ nullable: false })
  direccion!: string;

  @Property({ nullable: false })
  nroTelefono!: number;

  @Property({ nullable: false })
  email!: string;
}
