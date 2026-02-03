export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message); // Sets the Error.message
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError'; // Overrides default Error name
  }
}
