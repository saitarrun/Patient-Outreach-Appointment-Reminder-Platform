import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp(),
        json() // JSON format for easy parsing by CloudWatch/Datadog
    ),
    defaultMeta: { service: 'patient-outreach-server' },
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'development'
                ? combine(colorize(), simple()) // Colorful logs for local dev
                : json()
        }),
    ],
});
