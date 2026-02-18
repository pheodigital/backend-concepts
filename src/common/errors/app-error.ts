export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any; // <--- optional

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message); // Sets the Error.message
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError'; // Overrides default Error name
    this.details = details;
  }
}
