export const APP_CONFIG = {
  appName: 'VIDDL',
  appDescription: 'Universal Video Downloader from URL',
  processingProvider: (process.env.PROCESSING_PROVIDER || 'mock') as 'mock' | 'external',
  processingApiUrl: process.env.PROCESSING_API_URL || 'https://api.mock-processor.local',
  processingApiKey: process.env.PROCESSING_API_KEY || '',
  rateLimit: {
    guest: {
      analyzePerHour: parseInt(process.env.RATE_LIMIT_GUEST_ANALYZE_PER_HOUR || '5', 10),
      downloadPerHour: parseInt(process.env.RATE_LIMIT_GUEST_DOWNLOAD_PER_HOUR || '2', 10),
    },
    user: {
      analyzePerHour: parseInt(process.env.RATE_LIMIT_USER_ANALYZE_PER_HOUR || '30', 10),
      downloadPerHour: parseInt(process.env.RATE_LIMIT_USER_DOWNLOAD_PER_HOUR || '10', 10),
    },
  },
  fileExpirationHours: parseInt(process.env.FILE_EXPIRATION_HOURS || '2', 10),
  maxUrlLength: 2048,
};
