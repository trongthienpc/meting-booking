import { Worker } from "bullmq";
import { connection } from "./redis";
export function createWorker<T>(
  queueName: string,
  handler: (payload: T) => Promise<void>
) {
  const worker = new Worker<T>(
    queueName,
    async (job) => await handler(job.data),
    {
      connection,
      // limiter: {
      //   max: 10, // max 10 job
      //   duration: 1000, // mỗi 1s
      // },
    }
  );

  worker.on("completed", (job) =>
    console.log(`[${queueName}] Job ${job.id} done`)
  );
  worker.on("failed", (job, err) =>
    console.error(`[${queueName}] Job ${job?.id} failed`, err)
  );
}
