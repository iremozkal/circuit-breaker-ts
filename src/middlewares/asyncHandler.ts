import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express middleware that wraps asynchronous route handlers, providing consistent error handling and response serialization.
 * It takes a route handler function and returns a new function that wraps the handler.
 * The wrapped handler catches any errors thrown during execution and forwards them to the error handling middleware.
 * Additionally, it serializes the response object to handle BigInt values and complex objects before sending the response.
 * @param fn - The route handler function to be wrapped.
 * @returns An asynchronous function that handles the route logic with error handling and response serialization.
 */
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      const result = await fn(req, res, next);
      if (!res.headersSent) {
        res
          .status(getStatusCode(req.method, result))
          .json({ data: serializeResponse(result) });
      }
    } catch (error) {
      next(error);
    }
  };

function getStatusCode(method: string, result: unknown): number {
  switch (method) {
    case "POST":
      return 201;
    case "PUT":
      return result ? 200 : 204;
    case "DELETE":
      return 204;
    default:
      return 200;
  }
}

function serializeResponse(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  switch (typeof data) {
    case "bigint":
      return data.toString();
    case "number":
    case "string":
    case "boolean":
      return data;
    case "object":
      // Recursively serialize array elements
      if (Array.isArray(data)) {
        return data.map(serializeResponse);
      }

      if (data instanceof Date) {
        return data.toISOString();
      }

      // Type guard for Firestore timestamp-like objects
      if (
        data &&
        typeof data === "object" &&
        "_seconds" in data &&
        "_nanoseconds" in data
      ) {
        const firestoreData = data as {
          _seconds: number;
          _nanoseconds: number;
        };
        const milliseconds =
          firestoreData._seconds * 1000 +
          firestoreData._nanoseconds / 1_000_000;
        return new Date(milliseconds).toISOString();
      }

      // Handle other objects recursively
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          serializeResponse(value),
        ])
      );
    default:
      return data;
  }
}
