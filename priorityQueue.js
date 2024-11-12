class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueueWithPriority(item) {
    if (item.important) {
      const lastImportantIndex = this.items.findLastIndex(n => n.important);
      if (lastImportantIndex === -1) {
        this.items.unshift(item);
      } else {
        this.items.splice(lastImportantIndex + 1, 0, item);
      }
    } else {
      this.items.push(item);
    }
  }

  bulkEnqueue(items) {
    items.forEach(item => this.enqueueWithPriority(item));
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

module.exports = PriorityQueue;
