import { HTTPAuthorizationError } from '../../../src';
import { AuthInterceptors } from '../../../src/interceptors';
import { MockAuthManager, MockAuthProvider, MockHttpClient, MockURLValidator } from '../mocks';

describe('AuthInterceptors', () => {
  let mockAuthManager: MockAuthManager;
  let mockHttpClient: MockHttpClient;
  let mockURLValidator: MockURLValidator;

  beforeEach(() => {
    mockURLValidator = new MockURLValidator();
    mockAuthManager = new MockAuthManager();
    mockHttpClient = new MockHttpClient({ baseURL: 'https://example.com' }, mockURLValidator);

    jest.spyOn(mockAuthManager, 'authenticate');
    jest.spyOn(mockAuthManager, 'handleUnauthorizedError');
    jest.spyOn(mockAuthManager, 'authenticateRequest');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ensurePreAuthentication', () => {
    it('should trigger authentication if strategy is defined and user is not authenticated', async () => {
      // Arrange
      mockAuthManager.setStrategy(MockAuthProvider.identifier, {});

      const interceptor = AuthInterceptors.ensurePreAuthentication(mockAuthManager, mockHttpClient);
      const request = new Request('https://example.com');

      // Act
      await interceptor({ request });

      // Assert
      expect(mockAuthManager.authenticate).toHaveBeenCalledWith(mockHttpClient);
      expect(mockAuthManager.isAuthenticated).toBe(true);
    });

    it('should not trigger authentication if user is already authenticated', async () => {
      // Arrange
      mockAuthManager['_isAuthenticated'] = true;
      mockAuthManager.setStrategy(MockAuthProvider.identifier, {});

      const interceptor = AuthInterceptors.ensurePreAuthentication(mockAuthManager, mockHttpClient);
      const request = new Request('https://example.com');

      // Act
      await interceptor({ request });

      // Assert
      expect(mockAuthManager.authenticate).not.toHaveBeenCalled();
    });

    it('should not trigger authentication if no strategy is defined', async () => {
      // Arrange
      const interceptor = AuthInterceptors.ensurePreAuthentication(mockAuthManager, mockHttpClient);
      const request = new Request('https://example.com');

      // Act
      await interceptor({ request });

      // Assert
      expect(mockAuthManager.authenticate).not.toHaveBeenCalled();
    });
  });

  describe('authenticateRequests', () => {
    it('should call authenticateRequest with request', () => {
      // Arrange
      mockAuthManager.setStrategy(MockAuthProvider.identifier, {});

      const interceptor = AuthInterceptors.authenticateRequests(mockAuthManager);
      const request = new Request('https://example.com');

      jest.spyOn(request.headers, 'set');

      // Act
      interceptor({ request });

      // Assert
      expect(mockAuthManager.authenticateRequest).toHaveBeenCalledWith(request);
      expect(request.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer <token>');
    });
  });

  describe('notifyOnUnauthorizedResponse', () => {
    it('should call handleUnauthorizedError on 401 response status', () => {
      // Arrange
      const [fulfillment] = AuthInterceptors.notifyOnUnauthorizedResponse(mockAuthManager);
      const request = new Request('https://example.com');
      const response = new Response(null, { status: 401 });

      // Act
      fulfillment({ request, response });

      // Assert
      expect(mockAuthManager.handleUnauthorizedError).toHaveBeenCalled();
    });

    it('should not call handleUnauthorizedError for non-401 response status', () => {
      // Arrange
      const [fulfillment] = AuthInterceptors.notifyOnUnauthorizedResponse(mockAuthManager);
      const request = new Request('https://example.com');
      const response = new Response(null, { status: 200 });

      // Act
      fulfillment({ request, response });

      // Assert
      expect(mockAuthManager.handleUnauthorizedError).not.toHaveBeenCalled();
    });

    it('should call handleUnauthorizedError on HTTPAuthorizationError rejection', () => {
      // Arrange
      const [, rejection] = AuthInterceptors.notifyOnUnauthorizedResponse(mockAuthManager);

      const request = new Request('https://example.com');
      const response = new Response(null, { status: 401 });

      const error = new HTTPAuthorizationError(response, request);

      // Act
      rejection(error);

      // Assert
      expect(mockAuthManager.handleUnauthorizedError).toHaveBeenCalled();
    });

    it('should not call handleUnauthorizedError for non HTTPAuthorizationError rejection', () => {
      // Arrange
      const [, rejection] = AuthInterceptors.notifyOnUnauthorizedResponse(mockAuthManager);
      const error = new Error('Other Error');

      // Act
      rejection(error);

      // Assert
      expect(mockAuthManager.handleUnauthorizedError).not.toHaveBeenCalled();
    });
  });
});
