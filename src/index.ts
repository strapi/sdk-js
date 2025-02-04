import { ApiTokenAuthProvider } from './auth';
import { Strapi } from './sdk';

import type { StrapiConfig } from './sdk';

export interface Config {
  /**
   * The base URL of the Strapi content API.
   *
   * This specifies where the SDK should send requests.
   *
   * The URL must include the protocol (`http` or `https`) and serve
   * as the root path for all later API operations.
   *
   * @example
   * 'https://api.example.com'
   *
   * @remarks
   * Failing to provide a valid HTTP or HTTPS URL results in a
   * `StrapiInitializationError`.
   */
  baseURL: string;

  /**
   * API token to authenticate requests (optional).
   *
   * When provided, this token is included in the `Authorization` header
   * of every request to the Strapi API.
   *
   * @remarks
   * - A valid token must be a non-empty string.
   *
   * - If the token is invalid or improperly formatted, the SDK
   * throws a `StrapiValidationError` during initialization.
   *
   * - If excluded, the SDK operates without authentication.
   */

  auth?: string;
}

/**
 * Creates a new instance of the Strapi SDK with a specified configuration.
 *
 * The Strapi SDK functions as a client library to interface with the Strapi content API.
 *
 * It facilitates reliable and secure interactions with Strapi's APIs by handling URL validation,
 * request dispatch, and response parsing for content management.
 *
 * @param config - The configuration for initializing the SDK. This should include the base URL
 *                 of the Strapi content API that the SDK communicates with. The baseURL
 *                 must be formatted with one of the supported protocols: `http` or `https`.
 *                 Additionally, optional authentication details can be specified within the config.
 *
 * @returns An instance of the Strapi SDK configured with the specified baseURL and auth settings.
 *
 * @example
 * ```typescript
 * // Basic configuration using API token auth
 * const config = {
 *   baseURL: 'https://api.example.com',
 *   auth: 'your_token_here',
 * };
 *
 * // Create the SDK instance
 * const sdk = strapi(config);
 *
 * // Using the SDK to fetch content from a custom endpoint
 * const response = await sdk.fetch('/content-endpoint');
 * const data = await response.json();
 *
 * console.log(data);
 * ```
 *
 * @throws {StrapiInitializationError} If the provided baseURL doesn't conform to a valid HTTP or HTTPS URL,
 *                                        or if the auth configuration is invalid.
 */
export const strapi = (config: Config) => {
  const { baseURL, auth } = config;

  const sdkConfig: StrapiConfig = { baseURL };

  // In this factory, while there is only one auth strategy available, users can't manually set the strategy options.
  // Since the SDK constructor needs to define a proper strategy,
  // it is handled here if the auth property is provided
  if (auth !== undefined) {
    sdkConfig.auth = {
      strategy: ApiTokenAuthProvider.identifier,
      options: { token: auth },
    };
  }

  return new Strapi(sdkConfig);
};

// Error classes
export * from './errors';

// Public types and interfaces
export type { StrapiConfig, Strapi } from './sdk';
export type { CollectionTypeManager, SingleTypeManager } from './content-types';
