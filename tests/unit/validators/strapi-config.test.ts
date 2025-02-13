import { StrapiValidationError, URLValidationError } from '../../../src';
import { StrapiConfigValidator, URLValidator } from '../../../src/validators';

import type { StrapiConfig } from '../../../src/client';

describe('Strapi Config Validator', () => {
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
        const validator = new StrapiConfigValidator(urlValidatorMock);
        const expected = new StrapiValidationError(
          new TypeError('The provided configuration is not a valid object.')
        );

        // Act & Assert
        expect(() => validator.validateConfig(config as StrapiConfig)).toThrow(expected);
      }
    );

    it('should not throw an error if config is a valid object', () => {
      // Arrange
      const config = { baseURL: 'https://example.com' };
      const validator = new StrapiConfigValidator(urlValidatorMock);

      // Act & Assert
      expect(() => validator.validateConfig(config)).not.toThrow();
    });
  });

  describe('validateBaseURL', () => {
    it('should call validateBaseURL method with the baseURL', () => {
      // Arrange
      const validator = new StrapiConfigValidator(urlValidatorMock);
      const config: StrapiConfig = { baseURL: 'http://valid.url' };

      // Act
      validator.validateConfig(config);

      // Assert
      expect(urlValidatorMock.validate).toHaveBeenCalledWith('http://valid.url');
    });

    it('should throw StrapiValidationError on URLValidationError', () => {
      // Arrange
      const validator = new StrapiConfigValidator(urlValidatorMock);
      const baseURL = 'invalid-url';

      urlValidatorMock.validate.mockImplementationOnce(() => {
        throw new URLValidationError('invalid url');
      });

      // Act & Assert
      expect(() => validator.validateConfig({ baseURL })).toThrow(StrapiValidationError);
    });
  });
});
