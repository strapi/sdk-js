import { ApiTokenAuthProvider, ApiTokenAuthProviderOptions } from '../../../../src/auth';
import { StrapiSDKValidationError } from '../../../../src/errors';

describe('ApiTokenAuthProvider', () => {
  describe('Name', () => {
    it('should return the static provider name from the instance', () => {
      // Arrange
      const token = 'abc-xyz';
      const provider = new ApiTokenAuthProvider({ token });

      // Act
      const name = provider.name;

      // Assert
      expect(name).toBe(ApiTokenAuthProvider.identifier);
    });
  });

  describe('Preflight Validation', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(ApiTokenAuthProvider.prototype, 'preflightValidation');
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it('should throw error if token is invalid in preflightValidation', () => {
      // Arrange
      const token = '    ';

      // Act & Assert
      expect(() => new ApiTokenAuthProvider({ token })).toThrow(StrapiSDKValidationError);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not throw error if token is valid in preflightValidation', () => {
      // Arrange
      const token = 'abc-xyz';

      // Act & Assert
      expect(() => new ApiTokenAuthProvider({ token })).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should throw error when token is null in preflightValidation', () => {
      // Arrange
      const options = { token: null } as unknown as ApiTokenAuthProviderOptions;

      // Act & Assert
      expect(() => new ApiTokenAuthProvider(options)).toThrow(StrapiSDKValidationError);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authenticate', () => {
    it('should do nothing when authenticate is called', async () => {
      // Arrange
      const token = 'abc-xyz';
      const provider = new ApiTokenAuthProvider({ token });

      // Act & Assert
      await expect(provider.authenticate()).resolves.not.toThrow();
    });
  });

  describe('Headers', () => {
    it('should return correct headers with valid token', () => {
      // Arrange
      const token = 'abc-xyz';
      const provider = new ApiTokenAuthProvider({ token });

      // Act
      const headers = provider.headers;

      // Assert
      expect(headers).toEqual({ Authorization: `Bearer ${token}` });
    });

    it('should maintain immutability of headers', () => {
      // Arrange
      const token = 'abc-xyz';
      const provider = new ApiTokenAuthProvider({ token });

      // Act
      provider.headers.Authorization = 'Modified_1';

      // Assert
      expect(provider.headers.Authorization).toEqual(`Bearer ${token}`);
    });
  });
});
