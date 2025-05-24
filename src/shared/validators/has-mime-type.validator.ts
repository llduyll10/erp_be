import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a file has one of the specified MIME types
 * @param allowedMimeTypes Array of allowed MIME types
 * @param validationOptions Validation options
 */
export function HasMimeType(
  allowedMimeTypes: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'hasMimeType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedMimeTypes],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || !value.mimetype) {
            return false;
          }

          const [allowedTypes] = args.constraints;
          return allowedTypes.includes(value.mimetype);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedTypes] = args.constraints;
          return `File must be one of the following types: ${allowedTypes.join(
            ', ',
          )}`;
        },
      },
    });
  };
}
