export const SECURITY_CONSTANTS = {
  RATE_LIMIT: {
    TTL: 60, // 1 minute
    LIMIT: 100, // 100 requests per minute
  },
  CORS: {
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    HEADERS: ['Content-Type', 'Authorization'],
    CREDENTIALS: true,
  },
  HELMET: {
    CONTENT_SECURITY_POLICY: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    REFERRER_POLICY: { policy: 'no-referrer' },
  },
}; 