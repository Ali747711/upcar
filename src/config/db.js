import mongoose from 'mongoose'

import { config } from './env.js'

// Don't buffer model calls forever when disconnected — fail fast instead.
mongoose.set('bufferTimeoutMS', 5000)
mongoose.set('strictQuery', true)

/**
 * Connect to MongoDB. Throws a clear error if the URI is missing so the server
 * never starts in a half-working state.
 */
export const connectDb = async () => {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is not configured — set it in your .env file')
  }

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 8000
  })

  console.log('Connected to MongoDB')
  return mongoose.connection
}

/** Close the MongoDB connection on graceful shutdown. */
export const disconnectDb = async () => {
  await mongoose.connection.close()
}
