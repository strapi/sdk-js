import { URLParsingError } from '../../../src/errors';
import { URLValidator } from '../../../src/validators';
import invalidURLs from '../../fixtures/invalid-urls.json';

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
  });

  describe('Parsing Validation', () => {
    it('should not throw when given a valid URL', () => {
      // Arrange
      const url = 'https://example.com';

      // Act & Assert
      expect(() => urlValidator.validate(url)).not.toThrow();
    });

    it.each<unknown>(invalidURLs.impossibleToParse)(
      'should throw an error for a non-string input: %s (%s)',
      (url) => {
        // Act & Assert
        expect(() => urlValidator.validate(url)).toThrow(new URLParsingError(url));
      }
    );
  });
});
