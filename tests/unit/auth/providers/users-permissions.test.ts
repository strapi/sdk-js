import { HTTPBadRequestError, StrapiValidationError } from '../../../../src';
import {
  UsersPermissionsAuthProvider,
  UsersPermissionsAuthProviderOptions,
} from '../../../../src/auth';
import { MockHttpClient, mockRequest, mockResponse } from '../../mocks';

const FAKE_TOKEN = '<token>';
const FAKE_VALID_CONFIG: UsersPermissionsAuthProviderOptions = {
  identifier: 'user@example.com',
  password: 'securePassword123',
};

class ValidFakeHttpClient extends MockHttpClient {
  async request() {
    return new Response(JSON.stringify({ jwt: FAKE_TOKEN }), { status: 200 });
  }
}

class FaultyFakeHttpClient extends MockHttpClient {
  async request(): Promise<Response> {
    const response = mockResponse(400, 'Bad Request');
    const request = mockRequest('GET', 'https://example.com');

    throw new HTTPBadRequestError(response, request);
  }
}

describe('UsersPermissionsAuthProvider', () => {
  const fakeHttpClient = new ValidFakeHttpClient({ baseURL: 'https://example.com' });
  const faultyHttpClient = new FaultyFakeHttpClient({ baseURL: 'https://example.com' });

  describe('Name', () => {
    it('should return the static provider name from the instance', () => {
      // Arrange
      const identifier = 'user@example.com';
      const password = 'securePassword123';
      const provider = new UsersPermissionsAuthProvider({ identifier, password });

      // Act
      const name = provider.name;

      // Assert
      expect(name).toBe(UsersPermissionsAuthProvider.identifier);
    });
  });

  describe('Preflight Validation', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(UsersPermissionsAuthProvider.prototype, 'preflightValidation');
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it.each([
      { identifier: null, password: 'securePassword123' },
      { identifier: true, password: 'securePassword123' },
      { identifier: 42, password: 'securePassword123' },
      { identifier: 'user@example.com', password: null },
      { identifier: 'user@example.com', password: true },
      { identifier: 'user@example.com', password: 42 },
      undefined,
      null,
      'not_an_object',
      42,
    ])('should throw error if credentials are invalid in preflightValidation: %s', (options) => {
      // Act & Assert
      expect(
        () =>
          new UsersPermissionsAuthProvider(
            options as unknown as UsersPermissionsAuthProviderOptions
          )
      ).toThrow(StrapiValidationError);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not throw error if identifier and password are valid in preflightValidation', () => {
      // Arrange
      const options = { identifier: 'user@example.com', password: 'securePassword123' };

      // Act & Assert
      expect(() => new UsersPermissionsAuthProvider(options)).not.toThrow();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authenticate', () => {
    it('should authenticate successfully without throwing', async () => {
      // Arrange
      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      // Act & Assert
      await provider.authenticate(fakeHttpClient);

      await expect(provider.authenticate(fakeHttpClient)).resolves.not.toThrow();
    });

    it('should set the headers correctly with the received token', async () => {
      // Arrange
      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      // Act
      await provider.authenticate(fakeHttpClient);

      // Assert
      expect(provider.headers).toEqual({ Authorization: `Bearer ${FAKE_TOKEN}` });
    });

    it('should throw an error if the request fails', async () => {
      // Arrange
      const client = fakeHttpClient.create(undefined, false);
      const statusText = 'Internal Server Error';

      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      jest
        .spyOn(client, 'request')
        .mockImplementationOnce(() =>
          Promise.resolve(new Response(null, { status: 500, statusText }))
        );

      // Act & Assert
      await expect(provider.authenticate(client)).rejects.toThrow(new Error(statusText));
    });

    it('should propagate the error if it fails to authenticate', async () => {
      // Arrange
      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      // Act & Assert
      await expect(provider.authenticate(faultyHttpClient)).rejects.toThrow(HTTPBadRequestError);
    });
  });

  describe('Headers', () => {
    it('should maintain immutability of headers', async () => {
      // Arrange
      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      // Act
      await provider.authenticate(fakeHttpClient);

      // It shouldn't be possible to modify the headers manually
      provider.headers.Authorization = 'Modified_1';

      // Assert
      expect(provider.headers.Authorization).toEqual(`Bearer ${FAKE_TOKEN}`);
    });

    it('should return an empty object if the provider has not perform authentication yet', () => {
      // Arrange
      const provider = new UsersPermissionsAuthProvider(FAKE_VALID_CONFIG);

      // Act
      const { headers } = provider;

      // Assert
      expect(headers).toEqual({});
    });
  });
});
