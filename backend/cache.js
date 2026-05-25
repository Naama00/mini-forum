const redis = require('redis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = redis.createClient({ url: redisUrl });
let isReady = false;

client.on('error', (err) => {
  isReady = false;
  logger.error({ err }, 'Redis client error');
});

client.on('ready', () => {
  isReady = true;
  logger.info({ redisUrl }, 'Redis client ready');
});

client.on('end', () => {
  isReady = false;
  logger.warn('Redis connection closed');
});

async function connectRedis() {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    isReady = false;
    logger.warn({ err: error }, 'Unable to connect to Redis; cache disabled');
    return null;
  }
}

function enabled() {
  return isReady && client.isOpen;
}

async function get(key) {
  if (!enabled()) return null;
  const rawValue = await client.get(key);
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    logger.error({ err: error, key }, 'Failed to parse Redis cache value');
    return null;
  }
}

async function set(key, value, ttlSeconds = 300) {
  if (!enabled()) return false;
  const payload = JSON.stringify(value);
  if (ttlSeconds > 0) {
    await client.set(key, payload, { EX: ttlSeconds });
  } else {
    await client.set(key, payload);
  }
  return true;
}

async function del(key) {
  if (!enabled()) return 0;
  return client.del(key);
}

async function invalidate(prefix) {
  if (!enabled()) return 0;

  let cursor = '0';
  let deleted = 0;

  do {
    const reply = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
    cursor = reply.cursor;
    if (reply.keys.length > 0) {
      deleted += await client.del(reply.keys);
    }
  } while (cursor !== '0');

  return deleted;
}

module.exports = {
  connectRedis,
  enabled,
  get,
  set,
  del,
  invalidate
};
