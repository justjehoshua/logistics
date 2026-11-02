export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown, // new: e.g. a list of field errors
  ) {
    super(message);
  }
}
