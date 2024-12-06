import { URLValidationError, URLParsingError } from '../../../src/errors';

describe('URL Errors', () => {
  describe('URLParsingError', () => {
    it('should construct with a correct error message', () => {
      // Arrange
      const url = 'invalid_url';

      // Act
      const error = new URLParsingError(url);

      // Assert
      expect(error).toBeInstanceOf(URLParsingError);
      expect(error).toBeInstanceOf(URLValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`Could not parse invalid URL: "${url}"`);
    });
  });
});
