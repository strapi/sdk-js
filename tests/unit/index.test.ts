import { strapi, StrapiInitializationError } from '../../src';
import { ApiTokenAuthProvider } from '../../src/auth';
import { Strapi } from '../../src/sdk';

import type { Config } from '../../src';

describe('strapi', () => {
  it('should create an SDK instance with valid http configuration', () => {
    // Arrange
    const config = { baseURL: 'https://api.example.com' } satisfies Config;

    // Act
    const sdk = strapi(config);

    // Assert
    expect(sdk).toBeInstanceOf(Strapi);
    expect(sdk).toHaveProperty('baseURL', config.baseURL);
  });

  it('should create an SDK instance with valid auth configuration', () => {
    // Arrange
    const token = '<token>';
    const config = { baseURL: 'https://api.example.com', auth: token } satisfies Config;

    // Act
    const sdk = strapi(config);

    // Assert
    expect(sdk).toBeInstanceOf(Strapi);
    expect(sdk).toHaveProperty('auth', {
      strategy: ApiTokenAuthProvider.identifier, // default auth strategy
      options: { token },
    });
  });

  it('should throw an error for an invalid baseURL', () => {
    // Arrange
    const config = { baseURL: 'invalid-url' } satisfies Config;

    // Act & Assert
    expect(() => strapi(config)).toThrow(StrapiInitializationError);
  });

  it('should throw an error if auth configuration is invalid', () => {
    // Arrange
    const config = {
      baseURL: 'https://api.example.com',
      auth: '', // Invalid API token
    } satisfies Config;

    // Act & Assert
    expect(() => strapi(config)).toThrow(StrapiInitializationError);
  });
});
