import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export async function connectRedis() {
  await redisClient.connect();
}

export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
}

export async function cacheGet(key: string): Promise<any | null> {
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
}

export async function cacheDel(key: string): Promise<void> {
  await redisClient.del(key);
}
