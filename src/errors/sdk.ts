export class StrapiSDKError extends Error {
  constructor(
    cause: unknown = undefined,
    message: string = 'An error occurred in the Strapi SDK. Please check the logs for more information.'
  ) {
    super(message);

    this.cause = cause;
  }
}

export class StrapiSDKValidationError extends StrapiSDKError {
  constructor(
    cause: unknown = undefined,
    message: string = 'Some of the provided values are not valid.'
  ) {
    super(cause, message);
  }
}

export class StrapiSDKInitializationError extends StrapiSDKError {
  constructor(cause: unknown = undefined, message: string = 'Could not initialize the Strapi SDK') {
    super(cause, message);
  }
}
