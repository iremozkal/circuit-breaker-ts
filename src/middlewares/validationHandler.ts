import { ClassConstructor, plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import { ApplicationValidationError } from "../shared/errors";
import { APP_MESSAGES } from "../shared/constants";

/**
 * Validates the request using class-validator.
 * @param classToConvert The class constructor representing the validation class.
 * @param body The part of the request to validate (e.g., 'req.body', 'req.params', 'req.query').
 */
export async function validateRequest<T extends object>(
  classToConvert: ClassConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<T> {
  const data = plainToClass(classToConvert, body);
  const errors = await validate(data);
  if (errors.length > 0) handleValidationErrors(errors);
  return data;
}

const handleValidationErrors = (errors: ValidationError[]) => {
  const errorDetails = errors.flatMap((error) => collectContraints(error));

  console.error(`ValidationErrors: ${JSON.stringify(errorDetails)}`);
  throw new ApplicationValidationError(
    APP_MESSAGES.defaultValidationErrorDesc,
    errorDetails
  );
};

const collectContraints = (
  error: ValidationError,
  parentPath = ""
): { field: string; message: string }[] => {
  const path = parentPath ? `${parentPath}.${error.property}` : error.property;
  const errorDetails: { field: string; message: string }[] = [];

  if (error?.constraints) {
    errorDetails.push(
      ...Object.values(error.constraints).map((message) => ({
        field: path,
        message,
      }))
    );
  }

  if (error?.children?.length) {
    error.children.forEach((child) => {
      errorDetails.push(...collectContraints(child, path));
    });
  }

  return errorDetails;
};
