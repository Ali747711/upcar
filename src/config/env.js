import dotenv from 'dotenv'

dotenv.config()

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// CORS origin is configurable, never hardcoded. Accepts a comma-separated
// list of origins, or "*" to allow any origin (handy in local dev).
const parseOrigins = (value) => {
  if (!value || value.trim() === '*') return '*'
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const config = {
  port: toNumber(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: parseOrigins(process.env.CORS_ORIGIN),
  // MongoDB connection string (Atlas or local). Required to start the server.
  mongoUri: process.env.MONGODB_URI ?? '',
  // JWT signing secret + token lifetime. Secret is required to start.
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  // bcrypt cost factor.
  bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, 10),
  // Default page size for paginated list endpoints.
  defaultPageSize: toNumber(process.env.DEFAULT_PAGE_SIZE, 20),
  maxPageSize: toNumber(process.env.MAX_PAGE_SIZE, 100),
  // Hard limit so a single huge payload can't exhaust memory / time budget.
  maxParts: toNumber(process.env.MAX_PARTS, 500),
  // Currency used for price/total formatting.
  currency: process.env.CURRENCY ?? 'USD',
  currencyLocale: process.env.CURRENCY_LOCALE ?? 'en-US',
  // Cloudinary image hosting. Optional — uploads fail with a clear error if
  // unset, but the rest of the service still runs.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'jq-bro/parts'
  },
  // Max upload size in bytes (default 8 MB).
  maxUploadBytes: toNumber(process.env.MAX_UPLOAD_BYTES, 8 * 1024 * 1024)
}

// True only when all required Cloudinary credentials are present.
export const isCloudinaryConfigured = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
)

export const isProduction = config.nodeEnv === 'production'
