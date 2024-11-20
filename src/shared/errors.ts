import { HttpStatusCode } from "axios";
import { APP_MESSAGES } from "./constants";

/**
 * BaseError: The base class for all custom error types in the application.
 * It includes properties like 'code', 'message', and an http 'statusCode'.
 */
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly message: string;
  public readonly statusCode: HttpStatusCode;

  protected constructor(
    code: string,
    message: string,
    statusCode: HttpStatusCode
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;

    // This clips the constructor invocation from the stack trace.
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ApplicationError: Represents generic application-level errors.
 */
export class ApplicationError extends BaseError {
  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.BadRequest
  ) {
    super("ApplicationError", message, statusCode);
  }
}

/**
 * ApplicationValidationError: Represents errors related to API input validation.
 */
export class ApplicationValidationError extends BaseError {
  details: { field: string; message: string }[];
  constructor(
    message: string = APP_MESSAGES.defaultValidationErrorDesc,
    details: { field: string; message: string }[] = [],
    statusCode: HttpStatusCode = HttpStatusCode.BadRequest
  ) {
    super("ValidationError", message, statusCode);
    this.details = details;
  }
}

/**
 * InternalServerError: Represents internal server errors with a fixed status code.
 */
export class InternalServerError extends BaseError {
  constructor(message: string) {
    super("InternalServerError", message, HttpStatusCode.InternalServerError);
  }
}

/**
 * AxiosError: Represents errors related to external axios calls with its http status codes.
 */ export class AxiosError extends BaseError {
  url: string;
  constructor(message: string, statusCode: HttpStatusCode, url: string) {
    super("AxiosError", message, statusCode);
    this.url = url;
  }
}
