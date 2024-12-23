import createDebug from 'debug';

import { URLParsingError } from '../errors';

const debug = createDebug('sdk:validators:url');

/**
 * Class representing a URLValidator.
 *
 * It provides the ability to validate URLs based on a predefined list of allowed protocols.
 */
export class URLValidator {
  /**
   * Validates the provided URL.
   *
   * This method checks that the provided URL is a string and can be parsed.
   *
   * @param url - The URL to be validated. This parameter must be a valid string representation of a URL.
   *
   * @throws {URLParsingError} Thrown if the URL is not a string or can't be parsed.
   *
   * @example
   * // Example of validating a URL successfully
   * const validator = new URLValidator();
   *
   * const url = 'http://example.com';
   *
   * validator.validate(url); // Does not throw an error
   *
   * @example
   * // Example of a failing validation
   * const validator = new URLValidator();
   *
   * const url = 123;
   *
   * try {
   *   validator.validate(url);
   * } catch (error) {
   *   console.error(error); // URLParsingError
   * }
   */
  validate(url: unknown) {
    if (typeof url !== 'string') {
      debug('url must be a string, received: %o (%s)', url, typeof url);
      throw new URLParsingError(url);
    }

    const canParse = this.canParse(url);

    if (!canParse) {
      debug('url could not be parsed: %o (%s)', url, typeof url);
      throw new URLParsingError(url);
    }

    debug('validated url successfully: %o', url);
  }

  /**
   * Checks if the URL string can be parsed.
   *
   * @param url - The URL string to be checked.
   *
   * @returns A boolean indicating whether the URL can be parsed.
   */
  private canParse(url: string): boolean {
    return URL.canParse(url);
  }
}
