export class URLValidationError extends Error {}

export class URLParsingError extends URLValidationError {
  constructor(url: unknown) {
    super(`Could not parse invalid URL: "${url}"`);
  }
}
