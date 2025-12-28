export const AI_RATE_LIMIT_CONFIG = {
  CREATE_SESSION: {
    limit: 5,
    ttl: 60000,
  },

  DEFAULT: {
    limit: 10,
    ttl: 60000,
  },
} as const;

export const RATE_LIMIT_MESSAGES = {
  AI_OPERATIONS:
    'Too many AI requests. Please wait a moment before trying again.',
  CREATE_SESSION:
    'You are creating mock interviews too quickly. Please wait a moment.',
} as const;
