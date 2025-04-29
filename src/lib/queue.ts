import IORedis from "ioredis";
import { Queue, QueueEvents } from "bullmq";

export interface UserActivityLogJob {
  userId: string;
  activity: string;
}

const MAX_RETRIES = 5;

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;
const redisConfig = {
  port: Number(redisPort),
  host: redisHost,
  retryStrategy(times: number) {
    if (times > MAX_RETRIES) {
      console.log(`Max retries reached ${MAX_RETRIES} times. No further retries`);
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    console.log(`Retry attempt ${times} with delay ${delay}ms`);
    return delay;
  },
  enableReadyCheck: true,
  reconnectOnError(err: Error) {
    console.log("Reconnect on error:", err.message);
    return true;
  },
  maxRetriesPerRequest: null,
};

console.log("Attempting Redis connection with config:", {
  host: redisConfig.host,
  port: redisConfig.port,
});

const connection = new IORedis(redisConfig);

// Enhanced event handling
connection.on("connect", () => {
  console.log(`Connected to Redis at ${redisConfig.host}:${redisConfig.port}`);
});

connection.on("ready", () => {
  console.log("Redis connection ready");
});

connection.on("end", () => {
  console.log("Redis connection ended");
});

connection.on("reconnecting", () => {
  console.log("Redis connection reconnecting");
});

connection.on("message", (channel, message) => {
  console.log(`Message received on channel ${channel}: ${message}`);
});

connection.on("wait", () => {
  console.log("Redis connection waiting");
});

connection.on("error", (err) => {
  console.error("Redis connection error: ", {
    message: err.message,
    name: err.name,
    stack: err.stack,
    cause: err.cause,
  });
});

connection.on("close", () => {
  console.log("Redis connection closed");
});

connection.on("reconnecting", (ms: number) => {
  console.log(`Redis reconnecting in ${ms}ms`);
});

export const queueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: false,
    removeOnError: false,
  },
};

const queueName = process.env.QUEUE_NAME ?? "userLogs";
console.log(`Initializing queue: ${queueName}`);

export const dynamic = "force-dynamic";
export const logsQueue = new Queue(queueName, queueOptions);

const queueEvents = new QueueEvents(queueName, { connection });

queueEvents.on("completed", ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: `, failedReason);
});
