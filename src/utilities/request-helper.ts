import { URLHelper } from './url-helper';

export class RequestHelper {
  /**
   * Formats a Fetch request into a concise, human-readable string.
   *
   * Extracts the HTTP method and URL from the given `Request` object
   * and formats them into a readable format for logging or debugging purposes.
   *
   * @param input -   The HTTP request to format.
   *                  This parameter must be a valid `Request` object that includes
   *                  the method and URL fields.
   *
   * @returns A formatted string representing the HTTP request in the form `<method> - <URL>`.
   *          The URL included in the formatted output contains only the origin and path,
   *          excluding any query parameters or fragments.
   *
   * @example
   * // Example usage of the `formatRequest` method:
   * const request = new Request('https://example.com/api/items?filter=active', { method: 'POST' });
   *
   * const formattedRequest = RequestHelper.format(request);
   * // Output: "POST - https://example.com/api/items"
   *
   * @see {@link URLHelper.toReadablePath}
   */
  public static format(input: Request): string {
    if (!(input instanceof Request)) {
      throw new TypeError(`Invalid input, expected a Request instance but found ${typeof input}`);
    }

    return `${input.method} - ${URLHelper.toReadablePath(input.url)}`;
  }
}
