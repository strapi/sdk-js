import { HttpInterceptors } from '../../../src/interceptors';
import { HTTP_ERROR_ASSOCIATIONS } from '../../fixtures/http-error-associations';

describe('HTTP Interceptors', () => {
  describe('setDefaultHeaders', () => {
    it('should add the headers to the given request', () => {
      // Arrange
      const request = new Request('https://example.com');

      const interceptor = HttpInterceptors.setDefaultHeaders();

      // Act
      interceptor({ request });

      // Assert
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should not override the headers if a value is already set', async () => {
      // Arrange
      const request = new Request('https://example.com', {
        headers: { 'Content-Type': 'text/plain' },
      });

      const interceptor = HttpInterceptors.setDefaultHeaders();

      // Act
      await interceptor({ request });

      // Assert
      expect(request.headers.get('Content-Type')).toBe('text/plain');
    });

    it('should perform case insensitive checks on headers', async () => {
      // Arrange
      const request = new Request('https://example.com', {
        headers: { 'content-type': 'text/plain' },
      });

      const interceptor = HttpInterceptors.setDefaultHeaders();

      // Act
      await interceptor({ request });

      // Assert
      expect(request.headers.get('Content-Type')).toBe('text/plain');
    });
  });

  describe('transformErrors', () => {
    const interceptor = HttpInterceptors.transformErrors();

    it('should do nothing if the response is not an error', async () => {
      // Arrange
      const request = new Request('https://example.com');
      const response = new Response(null, { status: 200 });

      // Act
      const res = await interceptor({ request, response });

      // Assert
      expect(res.request).toBe(request);
      expect(res.response).toBe(response);
    });

    it.each(HTTP_ERROR_ASSOCIATIONS)(
      'should throw the correct error for %j',
      async (statuses, errorClass) => {
        // Arrange
        const request = new Request('https://example.com');
        const response = new Response(null, statuses);

        const action = async () => await interceptor({ request, response });

        // Act & Assert
        await expect(action).rejects.toThrow(errorClass);
      }
    );
  });
});
