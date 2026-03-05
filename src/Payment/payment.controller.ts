import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ORM } from '../shared/db/orm.js';
import { Turno } from '../Turno/turno.entity.js';
import { EstadoTurno } from '../Turno/turno.enum.js';

// Usando valores de prueba proporcionados en .env o placeholder
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_tu_clave_aqui', {
    apiVersion: '2024-04-10' as any,
});

const PRICE_DOMESTIC = 2000; // $20.00 USD en centavos
const PRICE_OTHER = 3000;    // $30.00 USD en centavos

export async function createCheckoutSession(req: Request, res: Response) {
    try {
        const { turnoId } = req.body;
        const em = ORM.em.fork();

        const turno = await em.findOne(Turno, { id: turnoId }, { populate: ['mascota', 'mascota.raza', 'mascota.raza.especie'] as any });

        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }

        if (turno.pagado) {
            return res.status(400).json({ message: 'El turno ya ha sido pagado' });
        }

        if (turno.estado !== EstadoTurno.AGENDADO) {
            return res.status(400).json({ message: 'Solo se pueden pagar turnos agendados' });
        }

        const especieNombre = turno.mascota?.raza?.especie?.nombre?.toLowerCase();
        const isDomestic = ['perro', 'gato', 'conejo'].includes(especieNombre || '');
        const unitAmount = isDomestic ? PRICE_DOMESTIC : PRICE_OTHER;

        const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_tu_clave_aqui';

        // Fallback para testing si no hay clave real
        if (stripeKey === 'sk_test_tu_clave_aqui') {
            console.warn('Usando MOCK de Stripe (Sin clave real)');
            return res.json({
                id: 'mock_session_id',
                url: `http://localhost:5173/Turnos?success=true&turnoId=${turno.id}`
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Consulta Veterinaria - ${turno.mascota?.nombre}`,
                            description: `Turno #${turno.id} para ${especieNombre}`,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/Turnos?success=true&turnoId=${turno.id}`,
            cancel_url: `http://localhost:5173/Turnos?canceled=true`,
            metadata: {
                turnoId: turno.id.toString(),
                monto: (unitAmount / 100).toString(),
            },
        });

        res.json({ id: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error al crear sesión de Stripe:', error);
        res.status(500).json({
            message: 'Error al procesar el pago. Asegurate de tener una clave de Stripe válida en el backend.',
            error: error.message,
            stack: error.stack
        });
    }
}

export async function confirmPayment(req: Request, res: Response) {
    try {
        const { turnoId } = req.body;
        const em = ORM.em.fork();

        const turno = await em.findOne(Turno, { id: turnoId });

        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }

        // En una integración real, esto se haría vía Webhook de Stripe.
        // Por simplicidad para este TP, lo hacemos directo cuando el usuario vuelve de Stripe.
        turno.pagado = true;
        // El monto lo podríamos sacar de la sesión de Stripe si quisiéramos ser más estrictos
        const especieNombre = (await em.populate(turno, ['mascota', 'mascota.raza', 'mascota.raza.especie'] as any)).mascota?.raza?.especie?.nombre?.toLowerCase();
        turno.monto = ['perro', 'gato', 'conejo'].includes(especieNombre || '') ? 20 : 30;

        await em.flush();

        res.json({ message: 'Pago confirmado correctamente', data: turno });
    } catch (error: any) {
        res.status(500).json({ message: 'Error al confirmar el pago' });
    }
}
