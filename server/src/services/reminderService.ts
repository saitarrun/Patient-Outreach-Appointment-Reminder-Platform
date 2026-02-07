import { BullMQAdapter } from './queue/bullmq.adapter';
import { logger } from '../lib/logger';
import { remindersSentTotal } from '../lib/metrics';
import { PrismaClient } from '@prisma/client';
import { redisClient, acquireLock, releaseLock, checkIdempotencyKey, setIdempotencyKey } from './redis/redisService';

const prisma = new PrismaClient();
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
};

// Initialize Queue Adapter
export const reminderQueue = new BullMQAdapter('reminders', connection);

// Start Worker
reminderQueue.processJob('send-reminder', async (job) => {
    const { appointmentId, tenantId } = job.data;
    const lockKey = `lock:reminder:${appointmentId}`;

    // 1. Acquire Lock (prevent double processing if multiple workers)
    if (!await acquireLock(lockKey, 60)) {
        logger.warn(`Skipping locked reminder for ${appointmentId}`, { appointmentId });
        return;
    }

    try {
        logger.info(`Processing reminder`, { appointmentId, tenantId });

        // Quiet Hours Check (9PM - 8AM)
        const now = new Date();
        const hour = now.getHours();
        if (hour >= 21 || hour < 8) {
            logger.info(`Skipping reminder during quiet hours`, { appointmentId });
            return;
        }

        // 2. Idempotency Check (Business Logic level)
        const idempotencyKey = `processed:reminder:${appointmentId}`;
        if (await checkIdempotencyKey(idempotencyKey)) {
            logger.info(`Reminder already processed`, { appointmentId });
            return;
        }

        // 3. Send SMS/Email (Mock)
        await prisma.reminder.create({
            data: {
                id: job.id, // Use Job ID if generated, or uuid
                appointmentId: appointmentId,
                type: 'EMAIL',
                scheduledAt: new Date(),
                status: 'SENT',
                sentAt: new Date(),
            }
        });

        // 4. Set Idempotency Key (TTL 24 hours)
        await setIdempotencyKey(idempotencyKey, 86400);

        // Metric: Success
        remindersSentTotal.inc({ type: 'EMAIL', tenantId, status: 'success' });

        logger.info(`Reminder sent`, { appointmentId, tenantId });
    } catch (e) {
        logger.error("Error processing reminder", { error: e, appointmentId, tenantId });
        // Metric: Error
        remindersSentTotal.inc({ type: 'EMAIL', tenantId, status: 'error' });
        throw e; // Retry
    } finally {
        await releaseLock(lockKey);
    }
});

export const scheduleReminder = async (appointmentId: string, date: Date, tenantId: string) => {
    // Deduplication ID: unique per appointment (only 1 reminder per appointment in queue)
    const jobId = `reminder_${appointmentId}`;

    // Schedule a reminder 24 hours before
    const reminderTime = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    const delay = Math.max(0, reminderTime.getTime() - Date.now());

    await reminderQueue.addJob('send-reminder', { appointmentId, tenantId }, {
        delay,
        jobId // BullMQ will ignore duplicate adds with same Job ID
    });
    logger.info(`Scheduled reminder`, { appointmentId, reminderTime, jobId, tenantId });
};
