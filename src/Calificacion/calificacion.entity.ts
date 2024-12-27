import {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  Cascade,
  Rel,
  OneToOne,
} from '@mikro-orm/core';
import { Usuario } from '../Usuario/usuario.entity.js';
import { Veterinario } from '../Veterinario/veterinario.entity.js';
import { Turno } from '../Turno/turno.entity.js';

@Entity()
export class Calificacion {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Usuario, { nullable: false, cascade: [Cascade.ALL] })
  usuario!: Rel<Usuario>; // Usuario que deja la reseña.

  @ManyToOne(() => Veterinario, { nullable: false, cascade: [Cascade.ALL] })
  veterinario!: Rel<Veterinario>; // Veterinario que es evaluado.

  @OneToOne(() => Turno, { nullable: false, cascade: [Cascade.ALL] })
  turno!: Rel<Turno>; // Turno que se dejó la reseña.

  @Property({ nullable: false })
  puntuacion!: number; // Puntuación, de 1 a 5.

  @Property({ type: 'text', nullable: true })
  comentario?: string; // Comentario opcional.

  @Property({ nullable: false })
  fecha!: Date; // Fecha en que se dejó la reseña.

  @Property({ default: true })
  visible!: boolean; // Para manejar reseñas moderadas o eliminadas.

  @Property({ default: false })
  verificada!: boolean; // Indica si la reseña fue validada por el sistema.
}
