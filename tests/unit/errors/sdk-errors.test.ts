import {
  StrapiSDKError,
  StrapiSDKInitializationError,
  StrapiSDKValidationError,
} from '../../../src/errors';

describe('SDK Errors', () => {
  describe('StrapiSDKError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiSDKError();

      // Assert
      expect(error.message).toBe(
        'An error occurred in the Strapi SDK. Please check the logs for more information.'
      );
      expect(error.cause).toBeUndefined();
    });

    it('should allow a custom message', () => {
      // Arrange
      const customMessage = 'Custom error message.';

      // Act
      const error = new StrapiSDKError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Root cause');

      // Act
      const error = new StrapiSDKError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });

  describe('StrapiSDKValidationError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiSDKValidationError();

      // Assert
      expect(error.message).toBe('Some of the provided values are not valid.');
      expect(error.cause).toBeUndefined();
    });

    it('should allow a custom message', () => {
      // Arrange
      const customMessage = 'Validation error occurred.';

      // Act
      const error = new StrapiSDKValidationError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Validation root cause');

      // Act
      const error = new StrapiSDKValidationError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });

  describe('StrapiSDKInitializationError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiSDKInitializationError();

      // Assert
      expect(error.message).toBe('Could not initialize the Strapi SDK');
      expect(error.cause).toBeUndefined();
    });

    it('should allow a custom message', () => {
      // Arrange
      const customMessage = 'Initialization error occurred.';

      // Act
      const error = new StrapiSDKInitializationError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Initialization root cause');

      // Act
      const error = new StrapiSDKInitializationError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });
});
