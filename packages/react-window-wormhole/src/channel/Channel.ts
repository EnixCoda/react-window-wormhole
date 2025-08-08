export interface Channel<T = unknown> {
  onMessage: (handler: (message: T) => void) => void;
  postMessage(message: T): void;
  close(): void;
}
