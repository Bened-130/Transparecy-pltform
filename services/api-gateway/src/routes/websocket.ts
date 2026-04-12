import { FastifyInstance } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { pool } from '../services/database';

const connections = new Map<string, SocketStream>();
const subscriptions = new Map<string, Set<string>>();

export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/live', { websocket: true }, async (socket: SocketStream, request) => {
    try {
      const token = request.url.split('token=')[1];

      if (!token) {
        socket.send(JSON.stringify({ error: 'Missing token' }));
        socket.close();
        return;
      }

      // Verify JWT token
      try {
        const decoded = fastify.jwt.verify(token) as any;
        const userId = decoded.userId;
        const electionId = decoded.electionId;

        const connectionId = `${userId}-${Date.now()}`;
        connections.set(connectionId, socket);

        // Subscribe to election updates
        if (!subscriptions.has(electionId)) {
          subscriptions.set(electionId, new Set());
        }
        subscriptions.get(electionId)!.add(connectionId);

        socket.send(
          JSON.stringify({
            type: 'connection',
            message: 'Connected to live updates',
            connectionId,
          })
        );

        // Handle incoming messages
        socket.on('message', async (data: string) => {
          try {
            const message = JSON.parse(data);

            if (message.type === 'subscribe') {
              const subKey = `${electionId}-${message.pollingStationId}`;
              if (!subscriptions.has(subKey)) {
                subscriptions.set(subKey, new Set());
              }
              subscriptions.get(subKey)!.add(connectionId);
            }
          } catch (error) {
            socket.send(
              JSON.stringify({
                error: 'Invalid message format',
              })
            );
          }
        });

        // Handle disconnect
        socket.on('close', () => {
          connections.delete(connectionId);
          for (const [key, subs] of subscriptions.entries()) {
            subs.delete(connectionId);
          }
        });
      } catch (error) {
        socket.send(JSON.stringify({ error: 'Invalid token' }));
        socket.close();
      }
    } catch (error) {
      fastify.logger.error(error);
      socket.close();
    }
  });
}

// Function to broadcast updates
export function broadcastUpdate(
  electionId: string,
  pollingStationId: string | null,
  message: any
) {
  const subscribers = new Set<string>();

  // Add subscribers to election updates
  subscriptions.get(electionId)?.forEach((sub) => subscribers.add(sub));

  // Add subscribers to polling station updates
  if (pollingStationId) {
    subscriptions.get(`${electionId}-${pollingStationId}`)?.forEach((sub) => subscribers.add(sub));
  }

  const payload = JSON.stringify({
    type: message.type,
    timestamp: new Date().toISOString(),
    data: message.data,
  });

  subscribers.forEach((connectionId) => {
    const socket = connections.get(connectionId);
    if (socket) {
      try {
        socket.send(payload);
      } catch (error) {
        connections.delete(connectionId);
      }
    }
  });
}
