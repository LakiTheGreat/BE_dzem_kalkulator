export default class AppError extends Error {
  status: number;
  customStatusCode?: string;
  isOperational: boolean;

  constructor(message: string, status: number, customStatusCode?: string) {
    super(message);
    this.status = status;
    this.customStatusCode = customStatusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
