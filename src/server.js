import { createApp } from './app.js'
import { config } from './config/env.js'
import { connectDb, disconnectDb } from './config/db.js'
import { closeBrowser } from './services/browser.js'

const start = async () => {
  // Required secrets must be present before we accept any traffic.
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not configured — set it in your .env file')
  }

  // Connect to MongoDB before accepting traffic; fail fast if it's misconfigured.
  await connectDb()

  const app = createApp()
  const server = app.listen(config.port, () => {
    console.log(
      `PDF service listening on http://localhost:${config.port} (${config.nodeEnv})`
    )
  })

  // Gracefully drain requests, then release Chromium and the DB connection.
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down...`)
    server.close(async () => {
      await closeBrowser()
      await disconnectDb()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})
