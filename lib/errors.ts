export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errors = {
  unauthorized: () => new ApiError(401, 'Unauthorized', 'UNAUTHORIZED'),
  forbidden: () => new ApiError(403, 'Forbidden', 'FORBIDDEN'),
  notFound: (resource = 'Resource') => new ApiError(404, `${resource} not found`, 'NOT_FOUND'),
  badRequest: (message: string) => new ApiError(400, message, 'BAD_REQUEST'),
  conflict: (message: string) => new ApiError(409, message, 'CONFLICT'),
  internal: () => new ApiError(500, 'Internal server error', 'INTERNAL_ERROR'),
}
