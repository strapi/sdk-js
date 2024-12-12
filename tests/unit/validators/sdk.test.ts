import { StrapiSDKValidationError, URLValidationError } from '../../../src/errors';
import { StrapiSDKValidator, URLValidator } from '../../../src/validators';

import type { StrapiSDKConfig } from '../../../src/sdk';

describe('Strapi SDKValidator', () => {
  let urlValidatorMock: jest.Mocked<URLValidator>;

  beforeEach(() => {
    urlValidatorMock = new URLValidator() as jest.Mocked<URLValidator>;
    urlValidatorMock.validate = jest.fn();
  });

  describe('validateConfig', () => {
    it.each([undefined, null, 2, []])(
      'should throw an error if config is not a valid object (%s)',
      (config: unknown) => {
        // Arrange
        const validator = new StrapiSDKValidator(urlValidatorMock);
        const expected = new StrapiSDKValidationError(
          new TypeError('The provided configuration is not a valid object.')
        );

        // Act & Assert
        expect(() => validator.validateConfig(config as StrapiSDKConfig)).toThrow(expected);
      }
    );

    it('should not throw an error if config is a valid object', () => {
      // Arrange
      const config = { baseURL: 'https://example.com' };
      const validator = new StrapiSDKValidator(urlValidatorMock);

      // Act & Assert
      expect(() => validator.validateConfig(config)).not.toThrow();
    });
  });

  describe('validateBaseURL', () => {
    it('should call validateBaseURL method with the baseURL', () => {
      // Arrange
      const validator = new StrapiSDKValidator(urlValidatorMock);
      const config: StrapiSDKConfig = { baseURL: 'http://valid.url' };

      // Act
      validator.validateConfig(config);

      // Assert
      expect(urlValidatorMock.validate).toHaveBeenCalledWith('http://valid.url');
    });

    it('should throw StrapiSDKValidationError on URLValidationError', () => {
      // Arrange
      const validator = new StrapiSDKValidator(urlValidatorMock);
      const baseURL = 'invalid-url';

      urlValidatorMock.validate.mockImplementationOnce(() => {
        throw new URLValidationError('invalid url');
      });

      // Act & Assert
      expect(() => validator.validateConfig({ baseURL })).toThrow(StrapiSDKValidationError);
    });
  });

  describe('parseDocumentResponse', () => {
    it('should throw an error if response structure is invalid', async () => {
      // Arrange
      const validator = new StrapiSDKValidator(urlValidatorMock);
      const invalidResponse = new Response(JSON.stringify({ invalid: 'structure' }));

      // Act & Assert
      await expect(validator.parseSingleDocumentResponse(invalidResponse)).rejects.toThrow(
        StrapiSDKValidationError
      );
    });

    it('should return parsed response if structure is valid', async () => {
      // Arrange
      const validator = new StrapiSDKValidator(urlValidatorMock);
      const validResponse = new Response(JSON.stringify({ data: { id: 1 }, meta: {} }));

      // Act
      const result = await validator.parseSingleDocumentResponse(validResponse);

      // Assert
      expect(result).toEqual({ data: { id: 1 }, meta: {} });
    });
  });
});
