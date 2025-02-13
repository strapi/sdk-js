export class StrapiError extends Error {
  constructor(
    cause: unknown = undefined,
    message: string = 'An error occurred in the Strapi client. Please check the logs for more information.'
  ) {
    super(message);

    this.cause = cause;
  }
}

export class StrapiValidationError extends StrapiError {
  constructor(
    cause: unknown = undefined,
    message: string = 'Some of the provided values are not valid.'
  ) {
    super(cause, message);
  }
}

export class StrapiInitializationError extends StrapiError {
  constructor(
    cause: unknown = undefined,
    message: string = 'Could not initialize the Strapi Client'
  ) {
    super(cause, message);
  }
}
