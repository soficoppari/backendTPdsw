import cron from 'node-cron';
import { ORM } from '../db/orm.js';
import { Turno } from '../../Turno/turno.entity.js';
import { EstadoTurno } from '../../Turno/turno.enum.js';

export function initCancellationJob() {
    // Se ejecuta cada hora
    cron.schedule('0 * * * *', async () => {
        console.log('Ejecutando proceso de cancelación automática de turnos no pagados...');

        try {
            const em = ORM.em.fork();
            const now = new Date();

            // Buscamos turnos agendados, no pagados, que falten menos de 5 horas
            // y que no sean del pasado (aunque si son del pasado y no se pagaron, también deberían cancelarse/expirar)
            const limitDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);

            const turnosACancelar = await em.find(Turno, {
                estado: EstadoTurno.AGENDADO,
                pagado: false,
                fecha: { $lte: limitDate }
            });

            if (turnosACancelar.length > 0) {
                console.log(`Cancelando ${turnosACancelar.length} turnos por falta de pago.`);
                for (const turno of turnosACancelar) {
                    turno.estado = EstadoTurno.CANCELADO as any; // Usando as any por si hay temas de tipos con el enum y orm
                }
                await em.flush();
            }
        } catch (error) {
            console.error('Error en el job de cancelación automática:', error);
        }
    });
}
