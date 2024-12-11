import * as yup from 'yup';

import { StrapiSDKValidationError, URLValidationError } from '../errors';
import { GenericDocumentResponse } from '../types/content-api';

import { URLValidator } from './url';

import type { StrapiSDKConfig } from '../sdk';

/**
 * Provides the ability to validate the configuration used for initializing the Strapi SDK.
 *
 * This includes URL validation to ensure compatibility with Strapi's API endpoints.
 */
export class StrapiSDKValidator {
  private readonly _urlValidator: URLValidator;

  constructor(
    // Dependencies
    urlValidator: URLValidator = new URLValidator()
  ) {
    this._urlValidator = urlValidator;
  }

  /**
   * Validates the provided SDK configuration, ensuring that all values are
   * suitable for the SDK operations..
   *
   * @param config - The configuration object for the Strapi SDK. Must include a `baseURL` property indicating the API's endpoint.
   *
   * @throws {StrapiSDKValidationError} If the configuration is invalid, or if the baseURL is invalid.
   */
  validateConfig(config: StrapiSDKConfig) {
    if (
      config === undefined ||
      config === null ||
      Array.isArray(config) ||
      typeof config !== 'object'
    ) {
      throw new StrapiSDKValidationError(
        new TypeError('The provided configuration is not a valid object.')
      );
    }

    this.validateBaseURL(config.baseURL);
  }

  /**
   * Validates the base URL, ensuring it follows acceptable protocols and structure for reliable API interaction.
   *
   * @param url - The base URL string to validate.
   *
   * @throws {StrapiSDKValidationError} If the URL is invalid or if it fails through the URLValidator checks.
   */
  private validateBaseURL(url: unknown) {
    try {
      this._urlValidator.validate(url);
    } catch (e) {
      if (e instanceof URLValidationError) {
        throw new StrapiSDKValidationError(e);
      }

      throw e;
    }
  }

  pluralNameSchema = yup
    .string()
    .min(1)
    .matches(/^[a-z]+(-[a-z]+)*$/, 'pluralName must be in kebab-case')
    .required();

  /**
   * Validates the plural name to ensure it is a valid Strapi collection name.
   *
   * @param pluralName - The name to validate.
   * @throws {Error} If the plural name is invalid.
   */
  validatePluralName(pluralName: string) {
    try {
      this.pluralNameSchema.validateSync(pluralName);
    } catch (e) {
      throw new StrapiSDKValidationError(e);
    }
  }

  async parseDocumentResponse(response: Response): Promise<GenericDocumentResponse> {
    const json = await response.json();

    // Perform validation to ensure the JSON matches the DocumentResponse structure
    if (!json.data || !json.meta) {
      throw new StrapiSDKValidationError('Invalid response structure');
    }

    return json as GenericDocumentResponse;
  }
}
