import createDebug from 'debug';

import { StrapiValidationError, URLValidationError } from '../errors';

import { URLValidator } from './url';

import type { StrapiConfig } from '../client';

const debug = createDebug('strapi:validators:config');

/**
 * Provides the ability to validate the configuration used for initializing the Strapi client.
 *
 * This includes URL validation to ensure compatibility with Strapi's API endpoints.
 */
export class StrapiConfigValidator {
  private readonly _urlValidator: URLValidator;

  constructor(
    // Dependencies
    urlValidator: URLValidator = new URLValidator()
  ) {
    this._urlValidator = urlValidator;
  }

  /**
   * Validates the provided client configuration, ensuring that all values are
   * suitable for the client operations..
   *
   * @param config - The configuration object for the Strapi client. Must include a `baseURL` property indicating the API's endpoint.
   *
   * @throws {StrapiValidationError} If the configuration is invalid, or if the baseURL is invalid.
   */
  validateConfig(config: StrapiConfig) {
    debug('validating client config');

    if (
      config === undefined ||
      config === null ||
      Array.isArray(config) ||
      typeof config !== 'object'
    ) {
      debug(`provided client configuration is not a valid object: %o (%s)`, config, typeof config);

      throw new StrapiValidationError(
        new TypeError('The provided configuration is not a valid object.')
      );
    }

    this.validateBaseURL(config.baseURL);

    debug('validated client config successfully');
  }

  /**
   * Validates the base URL, ensuring it follows acceptable protocols and structure for reliable API interaction.
   *
   * @param url - The base URL string to validate.
   *
   * @throws {StrapiValidationError} If the URL is invalid or if it fails through the URLValidator checks.
   */
  private validateBaseURL(url: unknown) {
    try {
      debug('validating base url');
      this._urlValidator.validate(url);
    } catch (e) {
      if (e instanceof URLValidationError) {
        debug('failed to validate client config, invalid base url %o', url);
        throw new StrapiValidationError(e);
      }

      throw e;
    }
  }
}
