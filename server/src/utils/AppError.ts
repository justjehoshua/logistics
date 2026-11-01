export class AppError extends Error {
  constructor(
    public statusCode: number, // HTTP status, e.g. 404
    public code: string, // machine-readable, e.g. 'NOT_FOUND'
    message: string, // human-readable
  ) {
    super(message);
  }
}
// usage anywhere: throw new AppError(404, 'NOT_FOUND', 'Shipment not found');
