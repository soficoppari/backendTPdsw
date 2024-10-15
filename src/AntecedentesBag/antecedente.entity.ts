import { Cascade, Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property, } from '@mikro-orm/core'

@Entity()
export class Antecedente {
  @PrimaryKey()
  id!:number

  @Property()
  descripcion!:string

  @Property()
  fecha!:Date

  @Property()
  nombreMotivo!:string
}
