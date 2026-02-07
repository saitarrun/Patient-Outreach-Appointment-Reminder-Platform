import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

import rateLimit from 'express-rate-limit';

// Rate Limiting (1000 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

import { metricsMiddleware } from './middleware/metrics';
import { requestLogger } from './middleware/requestLogger';
import { register } from './lib/metrics';

app.use(requestLogger); // Add structured logging
app.use(metricsMiddleware);
app.use(limiter);
app.use(cors());
app.use(express.json());

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

import { tenantMiddlewareAsync } from './middleware/tenant';
app.use(tenantMiddlewareAsync);

import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

app.use('/api/patients', patientRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const start = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to Database');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

export { app };

if (require.main === module) {
    start();
}
