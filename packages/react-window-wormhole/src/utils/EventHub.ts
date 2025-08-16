export class EventHub<T> {
  listeners: ((event: T) => void)[] = [];
  addListener = (listener: (event: T) => void) => {
    this.listeners.push(listener);
  };

  removeListener = (listener: (event: T) => void) => {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) this.listeners.splice(index, 1);
  };

  dispatch = (event: T) => {
    this.listeners.forEach((listener) => listener(event));
  };
}
