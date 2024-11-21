export class Notification {
  userId: string
  message: string
  important: boolean
  id: string
  retries: number

  constructor(userId: string, message: string, important: boolean = false) {
    this.id = Math.random().toString(36).substring(2);
    this.userId = userId;
    this.message = message;
    this.retries = 0;
    this.important = important;
  }
}
