import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Mascota } from '../Mascota/mascota.entity.js';
import { Usuario } from '../Usuario/usuario.entity.js';

@Entity()
export class Turno {
  @PrimaryKey()
  id!: number;

  @Property()
  estado!: boolean;

  @Property({ nullable: false, unique: true })
  fechaHora!: string;

  @ManyToOne(() => Mascota, { nullable: false })
  mascota!: Rel<Mascota>; // Relación directa con Mascota

  @ManyToOne(() => Veterinario, { nullable: false })
  veterinario!: Rel<Veterinario>;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>;
}
