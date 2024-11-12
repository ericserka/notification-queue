# notification-queue

To use interactively: `node -i -e "$(cat repl.js)"`

## Example of use

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
