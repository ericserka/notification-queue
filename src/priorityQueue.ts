export class PriorityQueue<T> {
  private items: T[]

  constructor() {
    this.items = [];
  }

  enqueue(item: T, priorityCondition: (item: T) => boolean) {
    if (priorityCondition(item)) {
      const lastPriorityIndex = this.items.findLastIndex((n: T) => priorityCondition(n));
      if (lastPriorityIndex === -1) {
        this.items.unshift(item);
      } else {
        this.items.splice(lastPriorityIndex + 1, 0, item);
      }
    }
    else {
      this.items.push(item)
    }
  }

  bulkEnqueue(items: T[], prioritycondition: (item: T) => boolean) {
    items.forEach(item => this.enqueue(item, prioritycondition));
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
