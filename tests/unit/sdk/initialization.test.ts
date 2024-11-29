import {
  StrapiSDKInitializationError,
  StrapiSDKValidationError,
  URLParsingError,
  URLProtocolValidationError,
} from '../../../src/errors';
import { StrapiSDK } from '../../../src/sdk';
import { StrapiSDKValidator, URLValidator } from '../../../src/validators';
import invalidURLs from '../../fixtures/invalid-urls.json';

import type { StrapiSDKConfig } from '../../../src/sdk';
import type { URLProtocol } from '../../../src/validators/url';

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

describe('SDK Initialization', () => {
  let validateSpy: jest.SpyInstance;

  beforeEach(() => {
    validateSpy = jest.spyOn(StrapiSDKValidator.prototype, 'validateConfig');
  });

  afterEach(() => {
    validateSpy.mockRestore();
  });

  it('should initialize correctly when given a valid base url', () => {
    // Arrange
    let sdk!: StrapiSDK;

    const baseURL = 'http://localhost:1337';
    const config: StrapiSDKConfig = { baseURL };

    // Act
    const createSDK = () => {
      sdk = new StrapiSDK(config, new StrapiSDKValidator());
    };

    // Assert
    expect(createSDK).not.toThrow();

    expect(sdk).toBeDefined();

    expect(sdk.baseURL).toBe(baseURL);

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).toHaveBeenCalledWith(config);
  });

  describe('Unknown errors', () => {
    let urlValidatorSpy: jest.SpyInstance;

    beforeEach(() => {
      urlValidatorSpy = jest.spyOn(FlakyURLValidator.prototype, 'validate');
    });

    afterEach(() => {
      urlValidatorSpy.mockRestore();
    });

    it('should fail to create and SDK instance if there is an unexpected error', () => {
      // Arrange
      let sdk!: StrapiSDK;

      const baseURL = 'http://example.com';
      const config: StrapiSDKConfig = { baseURL };
      const expectedError = new StrapiSDKInitializationError(new Error('Unexpected error'));

      // Act
      const createSDK = () => {
        sdk = new StrapiSDK(config, new StrapiSDKValidator(new FlakyURLValidator()));
      };

      // Assert
      expect(createSDK).toThrow(expectedError);

      expect(sdk).toBeUndefined();

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith(config);

      expect(urlValidatorSpy).toHaveBeenCalledTimes(1);
      expect(urlValidatorSpy).toHaveBeenCalledWith(baseURL);
    });
  });

  describe('baseURL validation', () => {
    describe('Parsing Error', () => {
      it.each(invalidURLs.impossibleToParse)(
        'should fail to initialize when given an impossible to parse url: "%s" (%s)',
        (baseURL) => {
          // Arrange
          let sdk!: StrapiSDK;

          const config: StrapiSDKConfig = { baseURL };
          const expectedError = new StrapiSDKInitializationError(
            new StrapiSDKValidationError(new URLParsingError(baseURL))
          );

          // Act
          const createSDK = () => {
            sdk = new StrapiSDK(config, new StrapiSDKValidator());
          };

          // Assert
          expect(createSDK).toThrow(expectedError);

          expect(sdk).toBeUndefined();

          expect(validateSpy).toHaveBeenCalledTimes(1);
          expect(validateSpy).toHaveBeenCalledWith(config);
        }
      );
    });

    describe('Unsupported Protocol Error', () => {
      it.each(invalidURLs.unsupportedProtocols)(
        'should fail to initialize when given a baseURL with an unsupported protocol: "%s" (%s)',
        (baseURL) => {
          // Arrange
          let sdk!: StrapiSDK;

          const config: StrapiSDKConfig = { baseURL };
          const allowedProtocols = ['http:', 'https:'] satisfies URLProtocol[];
          const expectedError = new StrapiSDKInitializationError(
            new StrapiSDKValidationError(new URLProtocolValidationError(baseURL, allowedProtocols))
          );

          // Act
          const createSDK = () => {
            sdk = new StrapiSDK(config, new StrapiSDKValidator());
          };

          // Assert
          expect(createSDK).toThrow(expectedError);

          expect(sdk).toBeUndefined();

          expect(validateSpy).toHaveBeenCalledTimes(1);
          expect(validateSpy).toHaveBeenCalledWith(config);
        }
      );
    });
  });
});
