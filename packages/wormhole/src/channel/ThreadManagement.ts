import {
  ControlledPromise,
  createControlledPromise,
} from "../utils/ControlledPromise.js";
import { uuid } from "../utils/uuid.js";

export class ThreadManager {
  threadMap = new Map<string, ControlledPromise<any>>();

  constructor(private timeout = 100) {}

  create = <T>() => {
    const threadId = uuid();
    const cp: ControlledPromise<T> = createControlledPromise<T>();

    let state: "pending" | "resolved" | "rejected" = "pending";
    cp.promise
      .then(() => {
        state = "resolved";
      })
      .catch(() => {
        state = "rejected";
      });
    setTimeout(() => {
      if (state === "pending") {
        cp.reject(
          new Error(`Thread ${threadId} timed out after ${this.timeout}ms`),
        );
      }
    }, this.timeout);
    this.threadMap.set(threadId, cp);
    return [threadId, cp] as const;
  };

  get = (threadId: string) => {
    const cp = this.threadMap.get(threadId);
    if (!cp) {
      console.warn(`Thread not found: ${threadId}`);
    }
    return cp;
  };
}
