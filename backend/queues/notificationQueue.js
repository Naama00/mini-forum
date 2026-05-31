const { Queue, Worker } = require('bullmq');
const Notification = require('../models/Notification');
const logger = require('../logger');
const notificationEvents = require('../notificationEvents');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const queueOptions = { connection: { url: redisUrl } };

let notificationQueue = null;
let notificationWorker = null;
let isReady = false;

function createNotificationResources() {
  if (notificationQueue && notificationWorker) return;

  notificationQueue = new Queue('notifications', queueOptions);

  notificationWorker = new Worker(
    'notifications',
    async job => {
      const { recipient, sender, type, refModel, refId, text } = job.data;
      if (recipient.toString() === sender.toString()) {
        logger.debug({ jobId: job.id }, 'Skipped self-notification');
        return null;
      }

      const notification = await Notification.create({ recipient, sender, type, refModel, refId, text });
      notificationEvents.emit('notificationCreated', notification.toObject ? notification.toObject() : notification);
      return notification;
    },
    {
      connection: queueOptions.connection,
      concurrency: 5,
    }
  );

  notificationWorker.on('completed', job => {
    logger.debug({ jobId: job.id, name: job.name }, 'Notification job completed');
  });

  notificationWorker.on('failed', (job, err) => {
    logger.error({ jobId: job.id, err }, 'Notification job failed');
  });

  notificationWorker.on('error', err => {
    logger.error({ err }, 'Notification worker error');
  });
}

async function addNotificationJob(payload) {
  try {
    if (payload.recipient.toString() === payload.sender.toString()) {
      logger.debug('Skipped enqueueing self-notification');
      return;
    }

    if (!isReady || !notificationQueue) {
      logger.warn('Redis notification queue unavailable, writing notification directly');
      const notification = await Notification.create(payload);
      notificationEvents.emit('notificationCreated', notification.toObject ? notification.toObject() : notification);
      return;
    }

    await notificationQueue.add('createNotification', payload, {
      removeOnComplete: true,
      removeOnFail: { count: 1000 },
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to enqueue notification job, falling back to direct write');
    await Notification.create(payload);
  }
}

async function initializeNotificationQueue() {
  try {
    createNotificationResources();
    await notificationWorker.waitUntilReady();
    isReady = true;
    logger.info('Notification queue initialized');
  } catch (err) {
    isReady = false;
    logger.error({ err }, 'Failed to initialize notification queue');
    throw err;
  }
}

module.exports = {
  addNotificationJob,
  initializeNotificationQueue,
};
