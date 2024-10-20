import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Horario {
  @PrimaryKey()
  id!: number;

  @Property()
  fecha_hora_ini!: Date;

  @Property()
  fecha_hora_fin!: Date;

  @Property()
  actividad!: string; // Descripción de la actividad realizada durante este horario
}
