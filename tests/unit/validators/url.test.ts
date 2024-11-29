import { URLParsingError, URLProtocolValidationError } from '../../../src/errors';
import { URLValidator } from '../../../src/validators';

import type { URLProtocol } from '../../../src/validators/url';

const ALLOWED_PROTOCOLS: URLProtocol[] = ['http:', 'https:'];

describe('URLValidator', () => {
  let urlValidator: URLValidator;

  beforeEach(() => {
    urlValidator = new URLValidator();
  });

  describe('Protocol Validation', () => {
    it('should validate a valid HTTP URL', () => {
      // Arrange
      const url = 'http://example.com';

      // Act & Assert
      expect(() => urlValidator.validate(url)).not.toThrow();
    });

    it('should validate a valid HTTPS URL', () => {
      // Arrange
      const url = 'https://example.com';

      // Act & Assert
      expect(() => urlValidator.validate(url)).not.toThrow();
    });

    it('should throw an error for a URL with an invalid protocol', () => {
      // Arrange
      const url = 'ftp://example.com';

      // Act & Assert
      expect(() => urlValidator.validate(url)).toThrow(
        new URLProtocolValidationError(url, ALLOWED_PROTOCOLS)
      );
    });

    it('should allow custom configuration to validate different protocols', () => {
      // Arrange
      const url = 'ftp://example.com';
      const allowedProtocols: URLProtocol[] = ['file:', 'ftp:'];
      const customURLValidator = new URLValidator({ allowedProtocols });

      // Act & Assert
      expect(() => customURLValidator.validate(url)).not.toThrow();
    });
  });

  describe('Parsing Validation', () => {
    it('should not throw when given a valid URL', () => {
      // Arrange
      const url = 'https://example.com';

      // Act & Assert
      expect(() => urlValidator.validate(url)).not.toThrow();
    });

    it.each([123, null, undefined, true, {}, []])(
      'should throw an error for a non-string input: %s',
      (url: unknown) => {
        // Act & Assert
        expect(() => urlValidator.validate(url)).toThrow(
          new URLParsingError(`The provided URL is not a string. Got "${typeof url}"`)
        );
      }
    );
  });
});
