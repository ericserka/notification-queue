import { Notification } from './notification'
import { PriorityQueue } from './priorityQueue'

interface PendingWebhook {
  timeoutId: NodeJS.Timeout,
  notification: Notification
}

interface Options {
  maxConcurrent?: number,
  webhookTimeoutMs?: number
}

export class NotificationQueue {
  queue: PriorityQueue<Notification>
  processing: boolean
  maxConcurrent: number
  currentProcessing: number
  webhookTimeoutMs: number
  pendingWebhooks: Map<string, PendingWebhook>

  constructor(options: Options = {}) {
    this.queue = new PriorityQueue();
    this.processing = false;
    this.maxConcurrent = options.maxConcurrent || 5;
    this.currentProcessing = 0;
    this.webhookTimeoutMs = options.webhookTimeoutMs || 3600000; // 1 hour in ms
    this.pendingWebhooks = new Map();
  }

  async addNotification(notification: Notification) {
    this.queue.enqueue(notification, (item) => item.important);
    console.log(`Notification ${notification.id} added to queue with priority: ${notification.important}`);
    this.processQueue();
  }

  async addBulkNotifications(notifications: Notification[]) {
    console.log(`Adding ${notifications.length} notifications to queue`);
    this.queue.bulkEnqueue(notifications, (item) => item.important);
    this.processQueue();
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (!this.queue.isEmpty() && this.currentProcessing < this.maxConcurrent) {
      const notification = this.queue.dequeue() as Notification;
      this.currentProcessing++;
      this.processNotification(notification);
    }

    this.processing = false;
  }

  private async processNotification(notification: Notification) {
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

  private setupWebhookTimeout(notification: Notification) {
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

  async handleWebhook(notificationId: string, success: boolean) {
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

  private async handleFailure(notification: Notification) {
    if (notification.retries >= 1) {
      console.log(`Max retries reached for notification ${notification.id}`);
      return;
    }

    notification.retries++;
    await this.sendSMS(notification);
  }

  private async sendWhatsApp(notification: Notification) {
    console.log(`Sending WhatsApp message to user ${notification.userId} (Important: ${notification.important})`);
  }

  private async sendSMS(notification: Notification) {
    console.log(`Sending SMS to user ${notification.userId} (Important: ${notification.important})`);
  }
}
