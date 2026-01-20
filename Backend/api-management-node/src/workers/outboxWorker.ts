import { LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../infrastructure/db/data-source';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export async function startOutboxWorker() {
    const interval = process.env.OUTBOX_POLL_MS ? Number(process.env.OUTBOX_POLL_MS) : 5000;

    setInterval(async () => {
        try {
            const repo = AppDataSource.getRepository(OutboxEventEntity);
            const now = new Date();
            const pending = await repo.find({
                where: [
                    { status: 'pending' },
                    { status: 'retry', nextRetryAt: LessThanOrEqual(now) }
                ],
                order: { createdAt: 'ASC' },
                take: 10
            });

            for (const event of pending) {
                const ok = await sendEvent(event);
                if (ok) {
                    event.status = 'sent';
                } else {
                    event.status = 'retry';
                    event.tries += 1;
                    const backoffSeconds = Math.min(300, 5 * Math.pow(2, event.tries));
                    event.nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);
                }
                await repo.save(event);
            }
        } catch (error) {
            console.error('Outbox worker error', error);
        }
    }, interval);
}

async function sendEvent(event: OutboxEventEntity) {
    try {
        const response = await fetch(`${process.env.EVENTS_API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: event.type,
                payload: event.payload,
                occurredAt: event.createdAt
            })
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}
