# notification-queue

## Problem Scenario

Handle notification sending requests. Notifications must first be sent via WhatsApp. After sending via WhatsApp, a webhook must arrive informing whether the message was sent successfully or not. If the message failed, it must be sent via SMS (fallback). The webhook may not arrive. In this case, if it does not arrive within an hour, the message must also be sent via SMS (fallback).

Requests must be stored in a queue and this queue must be consumed with a limit, to avoid overload. Insertion into the queue must take into account the `important` attribute of the notification. If this attribute is `true`, such notification must be sent before those that have this attribute as `false`.

A single notification can be requested, as well as there can be requests to send notifications in bulk.

## Example of use

To install dependencies: `npm install`

To use interactively: `npm run repl`

```javascript
const notificationQueue = new NotificationQueue({
  maxConcurrent: 5,
  webhookTimeoutMs: 10000
});

const singleNotification = new Notification("user1", "important message", true)

await notificationQueue.addNotification(singleNotification);

const bulkNotifications = [new Notification("user2", "some message", false), new Notification("user3", "another important message", true)];

await notificationQueue.addBulkNotifications(bulkNotifications);
```
