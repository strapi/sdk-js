import { strapi, StrapiInitializationError, StrapiValidationError } from '../../src';
import { Strapi } from '../../src/sdk';

import type { StrapiConfig } from '../../src/sdk';

describe('strapi', () => {
  it('should create an SDK instance with valid configuration', () => {
    // Arrange
    const config = { baseURL: 'https://api.example.com' } satisfies StrapiConfig;

    // Act
    const sdk = strapi(config);

    // Assert
    expect(sdk).toBeInstanceOf(Strapi);
    expect(sdk).toHaveProperty('baseURL', config.baseURL);
  });

  it('should throw an error for an invalid baseURL', () => {
    // Arrange
    const config = { baseURL: 'invalid-url' } satisfies StrapiConfig;

    // Act & Assert
    expect(() => strapi(config)).toThrow(StrapiInitializationError);
  });

  it('should throw an error if auth configuration is invalid', () => {
    // Arrange
    const config = {
      baseURL: 'https://api.example.com',
      auth: {
        strategy: 'api-token',
        options: { token: '' }, // Invalid token
      },
    } satisfies StrapiConfig;

    // Act & Assert
    expect(() => strapi(config)).toThrow(StrapiValidationError);
  });
});
