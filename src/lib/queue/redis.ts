import IORedis from "ioredis";

export const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

// Connection events
connection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

connection.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

connection.on("ready", () => {
  console.log("📡 Redis is ready to accept commands");
});

connection.on("close", () => {
  console.log("🔌 Redis connection closed");
});

// Command monitoring
// connection.monitor((err, monitor) => {
//   if (err) {
//     console.error("Redis monitoring error:", err);
//     return;
//   }

//   monitor?.on("monitor", (time, args) => {
//     console.log("📊 Redis command:", time, args);
//   });
// });
