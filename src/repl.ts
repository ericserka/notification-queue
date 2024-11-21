import repl from 'repl'
import { NotificationQueue } from './notificationQueue'
import { Notification } from './notification'

const r = repl.start()

r.context.NotificationQueue = NotificationQueue
r.context.Notification = Notification
