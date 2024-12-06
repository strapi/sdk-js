import { ApiTokenAuthProvider, AuthManager, UsersPermissionsAuthProvider } from '../../../src/auth';
import { MockAuthProvider, MockAuthProviderFactory, MockHttpClient } from '../mocks';

describe('AuthManager', () => {
  const mockHttpClient = new MockHttpClient('https://example.com');

  describe('Default Registered Strategies', () => {
    it.each([
      [ApiTokenAuthProvider.identifier, ApiTokenAuthProvider, { token: '<token>' }],
      [
        UsersPermissionsAuthProvider.identifier,
        UsersPermissionsAuthProvider,
        { identifier: '<identifier>', password: '<password>' },
      ],
    ])(
      'should have a strategy registered by default: "%s"',
      (providerName, providerClass, options) => {
        // Arrange
        const mockAuthProviderFactory = new MockAuthProviderFactory();
        const authManager = new AuthManager(mockAuthProviderFactory);

        // Act
        const instance = mockAuthProviderFactory.create(providerName, options);

        // Assert
        expect(authManager).toBeInstanceOf(AuthManager);
        expect(instance).toBeInstanceOf(providerClass);
      }
    );
  });

  it('should have no strategy selected after initialization', () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());

    // Assert
    expect(authManager.strategy).toBeUndefined();
  });

  it('should set strategy correctly', () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());
    const strategy = MockAuthProvider.identifier;

    // Act
    authManager.setStrategy(strategy, {});

    // Assert
    expect(authManager.strategy).toBe(MockAuthProvider.identifier);
  });

  it('should not be authenticated when strategy is not set', async () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());

    // Act
    await authManager.authenticate(mockHttpClient);

    // Assert
    expect(authManager.isAuthenticated).toBe(false);
  });

  it('should authenticate correctly when strategy is set', async () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());
    authManager.setStrategy(MockAuthProvider.identifier, {});

    // Act
    await authManager.authenticate(mockHttpClient);

    // Assert
    expect(authManager.isAuthenticated).toBe(true);
  });

  it('should handle unauthorized error properly', async () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());
    authManager.setStrategy(MockAuthProvider.identifier, {});

    // Act
    await authManager.authenticate(mockHttpClient);
    authManager.handleUnauthorizedError();

    // Assert
    expect(authManager.isAuthenticated).toBe(false);
  });

  it('should not do anything if authenticate is called without setting strategy', async () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());

    // Assert
    await expect(authManager.authenticate(mockHttpClient)).resolves.toBeUndefined();
    expect(authManager.isAuthenticated).toBe(false);
  });

  it('should remove authentication if authenticate throws an error', async () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());
    authManager.setStrategy(MockAuthProvider.identifier, {});

    jest.spyOn(MockAuthProvider.prototype, 'authenticate').mockImplementationOnce(() => {
      throw new Error();
    });

    // Act
    await authManager.authenticate(mockHttpClient);

    // Assert
    expect(authManager.isAuthenticated).toBe(false);
  });

  it('should authenticate request correctly', () => {
    // Arrange
    const authManager = new AuthManager(new MockAuthProviderFactory());
    const mockRequest = new Request('https://example.com', { headers: new Headers() });

    authManager.setStrategy(MockAuthProvider.identifier, {});

    // Act
    authManager.authenticateRequest(mockRequest);

    // Assert
    expect(mockRequest.headers.get('Authorization')).toBe('Bearer <token>');
  });
});
