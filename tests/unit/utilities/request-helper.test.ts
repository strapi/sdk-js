import { RequestHelper } from '../../../src/utilities';

describe('RequestHelper', () => {
  describe('format', () => {
    it.each(['POST', 'GET', 'HEAD', 'PUT', 'DELETE'])(
      'should format valid requests and display the correct method: %s',
      (method) => {
        // Arrange
        const url = new URL('https://example.com/articles/1?param1=a&param2=b&param3=c');
        const request = new Request(url, { method });

        // Act
        const out = RequestHelper.format(request);

        // Assert
        expect(out).toBe(`${method} - https://example.com/articles/1`);
      }
    );

    it.each(['str', 42, undefined, null, {}, []])(
      'should throw a type error for invalid inputs: %s',
      (input) => {
        // Arrange
        const action = () => RequestHelper.format(input as unknown as Request);

        // Act & Assert
        expect(action).toThrow(
          new TypeError(`Invalid input, expected a Request instance but found ${typeof input}`)
        );
      }
    );
  });
});
