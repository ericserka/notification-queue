# notification-queue

## Problem Scenario

Handle notification sending requests. Notifications must first be sent via WhatsApp. After sending via WhatsApp, a webhook must arrive informing whether the message was sent successfully or not. If the message failed, it must be sent via SMS (fallback). The webhook may not arrive. In this case, if it does not arrive within an hour, the message must also be sent via SMS (fallback).

Requests must be stored in a queue and this queue must be consumed with a limit, to avoid overload. Insertion into the queue must take into account the `important` attribute of the notification. If this attribute is `true`, such notification must be sent before those that have this attribute as `false`.

A single notification can be requested, as well as there can be requests to send notifications in bulk.

## Example of use

To use interactively: `node -i -e "$(cat repl.js)"`

```javascript
const notificationQueue = new NotificationQueue({
  maxConcurrent: 5,
  webhookTimeoutMs: 3600000
});

const singleNotification = {userId: "user1", message: "important message", important: true}

await notificationQueue.addNotification(singleNotification);

const bulkNotifications = [
  {
    userId: "user2",
    message: "some message",
    important: false
  },
  {
    userId: "user3",
    message: "another important message",
    important: true
  }
];

await notificationQueue.addBulkNotifications(bulkNotifications);
```
