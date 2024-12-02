import { StrapiSDK } from './sdk';
import { StrapiSDKValidator } from './validators';

import type { StrapiSDKConfig } from './sdk';

/**
 * Creates a new instance of the Strapi SDK with a specified configuration.
 *
 * The Strapi SDK functions as a client library to interface with the Strapi content API.
 *
 * It facilitates reliable and secure interactions with Strapi's APIs by handling URL validation,
 * request dispatch, and response parsing for content management.
 *
 * @param config - The configuration for initializing the SDK. This should include the base URL
 *                 of the Strapi backend instance that the SDK communicates with. The baseURL
 *                 must be formatted with one of the supported protocols: `http` or `https`.
 *                 Additionally, optional authentication details can be specified within the config.
 *
 * @returns An instance of the Strapi SDK configured with the specified baseURL and auth settings.
 *
 * @example
 * ```typescript
 * // Basic configuration using API token auth
 * const sdkConfig = {
 *   baseURL: 'https://api.example.com',
 *   auth: {
 *     strategy: 'api-token',
 *     options: { token: 'your_token_here' }
 *   }
 * };
 *
 * // Create the SDK instance
 * const strapiSDK = createStrapiSDK(sdkConfig);
 *
 * // Using the SDK to fetch content from a custom endpoint
 * const response = await strapiSDK.fetch('/content-endpoint');
 * const data = await response.json();
 *
 * console.log(data);
 * ```
 *
 * @throws {StrapiSDKInitializationError} If the provided baseURL does not conform to a valid HTTP or HTTPS URL,
 *                                        or if the auth configuration is invalid.
 */
export const createStrapiSDK = (config: StrapiSDKConfig) => {
  const sdkValidator = new StrapiSDKValidator();

  return new StrapiSDK<typeof config>(
    // Properties
    config,
    // Dependencies
    sdkValidator
  );
};
