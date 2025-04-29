/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseQueueService } from "./base-queue";

export type PusherJobPayload = {
  channel: string;
  event: string;
  data: any;
};

export class PusherQueueService extends BaseQueueService<PusherJobPayload> {
  constructor() {
    super("pusher-queue");
  }

  async addJob(name: string, payload: PusherJobPayload) {
    return await this.queue.add(name, payload); // ✅ No TS error
  }
}

export const pusherQueue = new PusherQueueService();
