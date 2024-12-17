import { strapiSDK, StrapiSDKInitializationError, StrapiSDKValidationError } from '../../src';
import { StrapiSDK } from '../../src/sdk';

import type { StrapiSDKConfig } from '../../src/sdk';

describe('strapiSDK', () => {
  it('should create an SDK instance with valid configuration', () => {
    // Arrange
    const config = { baseURL: 'https://api.example.com' } satisfies StrapiSDKConfig;

    // Act
    const sdkInstance = strapiSDK(config);

    // Assert
    expect(sdkInstance).toBeInstanceOf(StrapiSDK);
    expect(sdkInstance).toHaveProperty('baseURL', config.baseURL);
  });

  it('should throw an error for an invalid baseURL', () => {
    // Arrange
    const config = { baseURL: 'invalid-url' } satisfies StrapiSDKConfig;

    // Act & Assert
    expect(() => strapiSDK(config)).toThrow(StrapiSDKInitializationError);
  });

  it('should throw an error if auth configuration is invalid', () => {
    // Arrange
    const config = {
      baseURL: 'https://api.example.com',
      auth: {
        strategy: 'api-token',
        options: { token: '' }, // Invalid token
      },
    } satisfies StrapiSDKConfig;

    // Act & Assert
    expect(() => strapiSDK(config)).toThrow(StrapiSDKValidationError);
  });
});
