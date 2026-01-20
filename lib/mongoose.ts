import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";
import "@/database";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const getDbName = (): string => {
  const nodeEnv = process.env.NODE_ENV || "development";

  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
  }

  switch (nodeEnv) {
    case "production":
      return "mocknetic";
    case "test":
      return "mocknetic_test";
    case "development":
    default:
      return "mocknetic_dev";
  }
};

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    logger.info("Using existing mongoose connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const dbName = getDbName();
    const nodeEnv = process.env.NODE_ENV || "development";

    logger.info(`Connecting to MongoDB (${nodeEnv}) - Database: ${dbName}`);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: dbName,
        maxPoolSize: nodeEnv === "production" ? 10 : 5,
        minPoolSize: nodeEnv === "production" ? 2 : 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((result) => {
        logger.info(`Connected to MongoDB - Database: ${dbName}`);
        return result;
      })
      .catch((error) => {
        logger.error(
          `Error connecting to MongoDB - Database: ${dbName}`,
          error,
        );
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

process.on("SIGINT", async () => {
  if (cached.conn) {
    await cached.conn.connection.close();
    logger.info("MongoDB connection closed due to app termination");
    process.exit(0);
  }
});

export default dbConnect;
