import { StrapiSDKInitializationError } from '../../src/errors';
import { StrapiSDK } from '../../src/sdk';
import { StrapiSDKValidator, URLValidator } from '../../src/validators';

import { MockAuthProvider, MockHttpClient, MockStrapiSDKValidator } from './mocks';

import type { StrapiSDKConfig } from '../../src/sdk';

/**
 * Class representing a FlakyURLValidator which extends URLValidator.
 *
 * This validator is designed to throw an error unexpectedly upon validation and should only be used in test suites.
 */
class FlakyURLValidator extends URLValidator {
  validate() {
    throw new Error('Unexpected error');
  }
}

describe('StrapiSDK', () => {
  const mockHttpClientFactory = (url: string) => new MockHttpClient(url);

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      // Arrange
      const config = {
        baseURL: 'http://localhost:1337',
        auth: { strategy: MockAuthProvider.identifier, options: {} },
      };

      const mockValidator = new MockStrapiSDKValidator();

      const sdkValidatorSpy = jest.spyOn(mockValidator, 'validateConfig');
      const httpSetAuthStrategySpy = jest.spyOn(MockHttpClient.prototype, 'setAuthStrategy');

      // Act
      const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

      // Assert

      // instance
      expect(sdk).toBeInstanceOf(StrapiSDK);
      // internal Validation
      expect(sdkValidatorSpy).toHaveBeenCalledWith(config);
      // internal setup
      expect(httpSetAuthStrategySpy).toHaveBeenCalledWith(MockAuthProvider.identifier, {});
    });

    it('should throw an error on invalid baseURL', () => {
      // Arrange
      const config = { baseURL: 'invalid-url' };

      const mockValidator = new MockStrapiSDKValidator();

      const validateConfigSpy = jest.spyOn(mockValidator, 'validateConfig');

      // Act & Assert
      expect(() => new StrapiSDK(config, mockValidator)).toThrow(StrapiSDKInitializationError);
      expect(validateConfigSpy).toHaveBeenCalledWith(config);
    });

    it('should fail to create and SDK instance if there is an unexpected error', () => {
      // Arrange
      let sdk!: StrapiSDK;

      const baseURL = 'http://example.com';
      const config: StrapiSDKConfig = { baseURL };
      const expectedError = new StrapiSDKInitializationError(new Error('Unexpected error'));

      const validateSpy = jest.spyOn(FlakyURLValidator.prototype, 'validate');

      // Act
      const createSDK = () => {
        sdk = new StrapiSDK(config, new StrapiSDKValidator(new FlakyURLValidator()));
      };

      // Assert
      expect(createSDK).toThrow(expectedError);

      expect(sdk).toBeUndefined();

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith(baseURL);
    });

    it('should initialize correctly with the default validator', () => {
      // Arrange
      const sdk = new StrapiSDK({ baseURL: 'http://localhost:1337' });

      // Act & Assert
      expect(sdk).toBeInstanceOf(StrapiSDK);
    });
  });

  // todo implement validation capabilities for providers (e.g. checks if the provided auth strategy exists before trying to create a provider instance)
  it.todo('should throw an error on invalid auth configuration');

  it('should fetch data correctly with fetch method', async () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337' };

    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    const mockValidator = new MockStrapiSDKValidator();
    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const response = await sdk.fetch('/data');

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/data', undefined);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('should retrieve baseURL correctly from config', () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337' };

    const mockValidator = new MockStrapiSDKValidator();

    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const { baseURL } = sdk;

    // Assert
    expect(baseURL).toBe(config.baseURL);
  });
});
