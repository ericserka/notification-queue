class Notification {
  constructor(userId, message, important = false) {
    this.id = Math.random().toString(36).substring(2);
    this.userId = userId;
    this.message = message;
    this.retries = 0;
    this.important = important;
  }
}

module.exports = Notification
