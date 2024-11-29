import { StrapiSDKInitializationError } from '../../src/errors';
import { StrapiSDK } from '../../src/sdk';

import { MockAuthProvider, MockHttpClient, MockStrapiSDKValidator } from './mocks';

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
    const response = await sdk.fetch('/api/data');

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith('/api/data', undefined);
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
