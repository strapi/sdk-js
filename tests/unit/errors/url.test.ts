import {
  URLValidationError,
  URLParsingError,
  URLProtocolValidationError,
} from '../../../src/errors';

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

  describe('URLProtocolValidationError', () => {
    it('should construct with a correct error message for a URL object', () => {
      // Arrange
      const url = new URL('ftp://example.com');
      const allowedProtocols = ['http:', 'https:'];

      // Act
      const error = new URLProtocolValidationError(url, allowedProtocols);

      // Assert
      expect(error).toBeInstanceOf(URLProtocolValidationError);
      expect(error).toBeInstanceOf(URLValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        `Only "http:", "https:" protocols are supported, but got "${url.protocol}" instead.`
      );
    });

    it('should construct with a correct error message for a string URL', () => {
      // Arrange
      const url = 'ftp://example.com';
      const allowedProtocols = ['http:', 'https:'];

      // Act
      const error = new URLProtocolValidationError(url, allowedProtocols);

      // Assert
      expect(error).toBeInstanceOf(URLProtocolValidationError);
      expect(error).toBeInstanceOf(URLValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        `Only "http:", "https:" protocols are supported, but got "ftp:" instead.`
      );
    });

    it('should handle empty allowedProtocols array', () => {
      // Arrange
      const url = 'ftp://example.com';
      const allowedProtocols: string[] = [];

      // Act
      const error = new URLProtocolValidationError(url, allowedProtocols);

      // Assert
      expect(error.message).toBe(`Only  protocols are supported, but got "ftp:" instead.`);
    });
  });
});
