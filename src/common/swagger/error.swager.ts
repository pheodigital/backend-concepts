/**
 * Standard API error response schema
 * Matches our AppError format
 */
export const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Invalid or expired token' },
      },
      required: ['code', 'message'],
    },
  },
};

/**
 * Common HTTP error responses
 * Reusable across all routes
 */
export const CommonErrorResponses = {
  400: {
    description: 'Bad Request',
    ...ErrorResponseSchema,
  },
  401: {
    description: 'Unauthorized',
    ...ErrorResponseSchema,
  },
  403: {
    description: 'Forbidden',
    ...ErrorResponseSchema,
  },
  404: {
    description: 'Not Found',
    ...ErrorResponseSchema,
  },
  500: {
    description: 'Internal Server Error',
    ...ErrorResponseSchema,
  },
};

/**
 * 🚦 Rate limit error (429)
 */
export const RateLimitErrorResponse = {
  429: {
    description: 'Too Many Requests',
    ...ErrorResponseSchema,
  },
};
