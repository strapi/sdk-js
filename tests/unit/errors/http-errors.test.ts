import {
  HTTPAuthorizationError,
  HTTPBadRequestError,
  HTTPError,
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPTimeoutError,
} from '../../../src/errors';
import { StatusCode } from '../../../src/http';
import { mockRequest, mockResponse } from '../mocks';

describe('HTTP Errors', () => {
  describe('HTTPError', () => {
    it('should correctly instantiate with a status code and status text', () => {
      // Arrange
      const response = mockResponse(504, 'Gateway Timeout');
      const request = mockRequest('GET', 'https://example.com/resource');

      // Act
      const error = new HTTPError(response, request);

      // Assert
      expect(error.name).toBe('HTTPError');
      expect(error.message).toBe(
        'Request failed with status code 504 Gateway Timeout: GET https://example.com/resource'
      );
      expect(error.response).toBe(response);
      expect(error.request).toBe(request);
    });

    it('should handle status code without status text', () => {
      // Arrange
      const response = mockResponse(500, undefined as unknown as string);
      const request = mockRequest('POST', 'https://example.com/update');

      // Act
      const error = new HTTPError(response, request);

      // Assert
      expect(error.message).toBe(
        'Request failed with status code 500: POST https://example.com/update'
      );
    });

    it('should handle requests with no status code', () => {
      // Arrange
      const response = mockResponse(undefined as any, '');
      const request = mockRequest('GET', 'https://example.com/unknown');

      // Act
      const error = new HTTPError(response, request);

      // Assert
      expect(error.message).toBe(
        'Request failed with an unknown error: GET https://example.com/unknown'
      );
    });
  });

  it.each([
    [HTTPBadRequestError.name, HTTPBadRequestError, StatusCode.BAD_REQUEST],
    [HTTPAuthorizationError.name, HTTPAuthorizationError, StatusCode.UNAUTHORIZED],
    [HTTPForbiddenError.name, HTTPForbiddenError, StatusCode.FORBIDDEN],
    [HTTPNotFoundError.name, HTTPNotFoundError, StatusCode.NOT_FOUND],
    [HTTPTimeoutError.name, HTTPTimeoutError, StatusCode.TIMEOUT],
    [HTTPInternalServerError.name, HTTPInternalServerError, StatusCode.INTERNAL_SERVER_ERROR],
  ])('%s', (name, errorClass, status) => {
    // Arrange
    const response = mockResponse(status, name);
    const request = mockRequest('GET', 'https://example.com');

    // Act
    const error = new errorClass(response, request);

    // Assert
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.name).toBe(name);
    expect(error.message).toBe(
      `Request failed with status code ${status} ${name}: GET https://example.com`
    );
    expect(error.response).toBe(response);
    expect(error.request).toBe(request);
  });
});
