/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, QueueOptions } from "bullmq";
import { connection } from "./redis";

export type QueueJobMap = Record<string, any>;

export class BaseQueueService<T extends QueueJobMap | any> {
  protected queue: Queue;

  constructor(private queueName: string, options?: QueueOptions) {
    this.queue = new Queue(queueName, {
      connection,
      ...options,
    });
  }

  // Case 1: T is a job map (multiple job names)
  addJob<K extends keyof T & string>(name: K, payload: T[K]): Promise<any>;

  // Case 2: T is single payload type (no job map)
  addJob(name: string, payload: T): Promise<any>;

  // Implementation
  addJob(name: string, payload: any) {
    return this.queue.add(name, payload);
  }

  getQueue() {
    return this.queue;
  }
}
