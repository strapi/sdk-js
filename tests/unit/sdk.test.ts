import { StrapiSDKInitializationError } from '../../src';
import { CollectionTypeManager, SingleTypeManager } from '../../src/content-types';
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

  beforeEach(() => {
    jest
      .spyOn(MockHttpClient.prototype, '_fetch')
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: { id: 1 }, meta: {} }), { status: 200 })
        )
      );
  });

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      // Arrange
      const config = {
        baseURL: 'http://localhost:1337/api',
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
      const sdk = new StrapiSDK({ baseURL: 'http://localhost:1337/api' });

      // Act & Assert
      expect(sdk).toBeInstanceOf(StrapiSDK);
    });
  });

  describe('Collection', () => {
    it('should return a new CollectionTypeManager instance when given a resource name', () => {
      // Arrange
      const resource = 'articles';
      const config = { baseURL: 'http://localhost:1337/api' };

      const mockValidator = new MockStrapiSDKValidator();
      const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

      // Act
      const collection = sdk.collection(resource);

      // Assert
      expect(collection).toBeInstanceOf(CollectionTypeManager);
      expect(collection).toHaveProperty('_pluralName', resource);
    });
  });

  describe('Single', () => {
    it('should return a new SingleTypeManager instance when given a resource name', () => {
      // Arrange
      const resource = 'homepage';
      const config = { baseURL: 'http://localhost:1337/api' };

      const mockValidator = new MockStrapiSDKValidator();
      const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

      // Act
      const single = sdk.single(resource);

      // Assert
      expect(single).toBeInstanceOf(SingleTypeManager);
      expect(single).toHaveProperty('_singularName', resource);
    });
  });

  // todo implement validation capabilities for providers (e.g. checks if the provided auth strategy exists before trying to create a provider instance)
  it.todo('should throw an error on invalid auth configuration');

  it('should fetch data correctly with fetch method', async () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337/api' };

    const fetchSpy = jest.spyOn(MockHttpClient.prototype, 'fetch');

    const mockValidator = new MockStrapiSDKValidator();
    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const response = await sdk.fetch('/data');

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/data', undefined);
    await expect(response.json()).resolves.toEqual({ data: { id: 1 }, meta: {} });
  });

  it('should retrieve baseURL correctly from config', () => {
    // Arrange
    const config = { baseURL: 'http://localhost:1337/api' };

    const mockValidator = new MockStrapiSDKValidator();

    const sdk = new StrapiSDK(config, mockValidator, mockHttpClientFactory);

    // Act
    const { baseURL } = sdk;

    // Assert
    expect(baseURL).toBe(config.baseURL);
  });
});
