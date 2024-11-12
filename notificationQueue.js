const Notification = require('./notification.js')
const PriorityQueue = require('./priorityQueue.js')

class NotificationQueue {
  constructor(options = {}) {
    this.queue = new PriorityQueue();
    this.processing = false;
    this.maxConcurrent = options.maxConcurrent || 5;
    this.currentProcessing = 0;
    this.webhookTimeoutMs = options.webhookTimeoutMs || 3600000; // 1 hour in ms
    this.pendingWebhooks = new Map();
  }

  async addNotification({ userId, message, important }) {
    const notification = new Notification(userId, message, important);
    this.queue.enqueueWithPriority(notification);
    console.log(`Notification ${notification.id} added to queue with priority: ${notification.important}`);
    this.processQueue();
    return notification;
  }

  async addBulkNotifications(notifications) {
    console.log(`Adding ${notifications.length} notifications to queue`);

    const createdNotifications = notifications.map(({ userId, message, important }) =>
      new Notification(userId, message, important)
    );

    this.queue.bulkEnqueue(createdNotifications);
    this.processQueue();

    return createdNotifications;
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (!this.queue.isEmpty() && this.currentProcessing < this.maxConcurrent) {
      const notification = this.queue.dequeue();
      this.currentProcessing++;
      this.processNotification(notification);
    }

    this.processing = false;
  }

  async processNotification(notification) {
    try {
      console.log(`Processing notification ${notification.id} (Important: ${notification.important})`);
      await this.sendWhatsApp(notification);

      this.setupWebhookTimeout(notification);
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      await this.handleFailure(notification);
    } finally {
      this.currentProcessing--;
      this.processQueue();
    }
  }

  setupWebhookTimeout(notification) {
    const timeoutId = setTimeout(async () => {
      if (!this.pendingWebhooks.has(notification.id)) return;

      console.log(`Webhook timeout for notification ${notification.id}`);
      this.pendingWebhooks.delete(notification.id);
      await this.handleFailure(notification);

    }, this.webhookTimeoutMs);

    this.pendingWebhooks.set(notification.id, {
      notification,
      timeoutId
    });
  }

  async handleWebhook(notificationId, success) {
    const pending = this.pendingWebhooks.get(notificationId);
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    this.pendingWebhooks.delete(notificationId);

    if (success) {
      console.log(`Notification ${notificationId} delivered successfully via WhatsApp`);
    } else {
      await this.handleFailure(pending.notification);
    }
  }

  async handleFailure(notification) {
    if (notification.retries >= 1) {
      console.log(`Max retries reached for notification ${notification.id}`);
      return;
    }

    notification.retries++;
    await this.sendSMS(notification);
  }

  async sendWhatsApp(notification) {
    console.log(`Sending WhatsApp message to user ${notification.userId} (Important: ${notification.important})`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`WhatsApp message sent to user ${notification.userId}`);
        resolve();
      }, 1000);
    });
  }

  async sendSMS(notification) {
    console.log(`Sending SMS to user ${notification.userId} (Important: ${notification.important})`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`SMS sent to user ${notification.userId}`);
        resolve();
      }, 1000);
    });
  }
}

module.exports = NotificationQueue
