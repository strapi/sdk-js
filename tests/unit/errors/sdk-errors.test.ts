import { StrapiError, StrapiInitializationError, StrapiValidationError } from '../../../src';

describe('Strapi Errors', () => {
  describe('StrapiError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiError();

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
      const error = new StrapiError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Root cause');

      // Act
      const error = new StrapiError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });

  describe('StrapiValidationError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiValidationError();

      // Assert
      expect(error.message).toBe('Some of the provided values are not valid.');
      expect(error.cause).toBeUndefined();
    });

    it('should allow a custom message', () => {
      // Arrange
      const customMessage = 'Validation error occurred.';

      // Act
      const error = new StrapiValidationError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Validation root cause');

      // Act
      const error = new StrapiValidationError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });

  describe('StrapiInitializationError', () => {
    it('should have a default message', () => {
      // Act
      const error = new StrapiInitializationError();

      // Assert
      expect(error.message).toBe('Could not initialize the Strapi SDK');
      expect(error.cause).toBeUndefined();
    });

    it('should allow a custom message', () => {
      // Arrange
      const customMessage = 'Initialization error occurred.';

      // Act
      const error = new StrapiInitializationError(undefined, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should set the cause if provided', () => {
      // Arrange
      const cause = new Error('Initialization root cause');

      // Act
      const error = new StrapiInitializationError(cause);

      // Assert
      expect(error.cause).toBe(cause);
    });
  });
});
