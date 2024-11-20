import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import {
  ApplicationError,
  ApplicationValidationError,
  AxiosError,
  BaseError,
} from "../shared/errors";

// Express middleware for handling errors and returning appropriate error responses.
/* eslint-disable @typescript-eslint/no-unused-vars */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = getStatusCode(error);

  if (error instanceof ApplicationError) {
    errorResponse(error, res, statusCode);
  } else if (error instanceof ApplicationValidationError) {
    errorResponse(error, res, statusCode, { details: error?.details });
  } else if (error instanceof AxiosError) {
    errorResponse(error, res, statusCode, { url: error?.url });
  } else {
    errorResponse(error, res, statusCode);
  }
};

const getStatusCode = (error: Error): HttpStatusCode => {
  if (
    error instanceof ApplicationError ||
    error instanceof ApplicationValidationError ||
    error instanceof AxiosError
  ) {
    return (error as BaseError).statusCode ?? HttpStatusCode.BadRequest;
  }
  return HttpStatusCode.InternalServerError;
};

const errorResponse = (
  error: Error,
  res: Response,
  statusCode: HttpStatusCode,
  additionalDetails?: object
) => {
  res.status(statusCode).json({
    error: {
      code: (error as BaseError)?.code ?? error?.name ?? "UnknownError",
      message: error?.message ?? "An unknown error occured",
      statusCode,
      ...additionalDetails,
    },
  });
};
