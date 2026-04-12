import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';

import { otpRoutes } from './routes/otp';
import { uploadRoutes } from './routes/upload';
import { websocketRoutes } from './routes/websocket';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const fastify = Fastify({
  logger: logger,
});

// ==================== PLUGINS ====================
fastify.register(fastifyCors, {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8081').split(','),
  credentials: true,
});

fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '15 minutes',
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  sign: {
    expiresIn: '24h',
  },
});

fastify.register(fastifyWebsocket);

// ==================== HEALTH CHECK ====================
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

// ==================== ROUTES ====================
fastify.register(otpRoutes, { prefix: '/api/v1/auth' });
fastify.register(uploadRoutes, { prefix: '/api/v1/uploads' });
fastify.register(websocketRoutes, { prefix: '/api/v1/ws' });

// ==================== ERROR HANDLING ====================
fastify.setErrorHandler((error, request, reply) => {
  logger.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error',
    code: error.code,
  });
});

// ==================== SERVER START ====================
const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' });
    logger.info(`Server running at http://0.0.0.0:${process.env.PORT || 3000}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
