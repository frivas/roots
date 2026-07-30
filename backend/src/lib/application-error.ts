export type ApplicationErrorCode =
  | 'CONFLICT'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED';

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    public readonly statusCode: number,
    message: string = code,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export const notFound = () => new ApplicationError('NOT_FOUND', 404);
export const forbidden = () => new ApplicationError('FORBIDDEN', 403);
export const conflict = () => new ApplicationError('CONFLICT', 409);
