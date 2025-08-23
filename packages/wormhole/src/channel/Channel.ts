export interface Channel {
  onMessage(handler: (payload: unknown) => void): void;
  postMessage(payload: unknown): void;
}
