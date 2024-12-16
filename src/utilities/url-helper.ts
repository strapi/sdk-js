import type { BaseQueryParams } from '../types/content-api';

export class URLHelper {
  /**
   * Appends query parameters to a given URL as a query string.
   *
   * It accepts an object of key-value pairs and transforms it into a properly formatted query string.
   *
   * The query string is appended to the base URL, ensuring that data structures such as arrays or nested objects are correctly serialized.
   *
   * If no query parameters are provided, the original URL is returned unchanged.
   *
   * @param url - The base URL onto which query params are added.
   * @param [queryParams] - An optional object containing query parameters to append.
   *
   * @returns The URL with the appended query string. If no query parameters are provided or if they're empty, the original URL remains unchanged.
   *
   * @example
   * ```typescript
   * // Example 1: appending a flat key-value pair
   * const url1 = URLHelper.appendQueryParams('https://api.example.com/resources', { locale: 'en' });
   * // Result: 'https://api.example.com/resources?locale=en'
   *
   * // Example 2: appending an array
   * const url2 = URLHelper.appendQueryParams('https://api.example.com/resources', { tags: ['news', 'tech'] });
   * // Result: 'https://api.example.com/resources?tags[0]=news&tags[1]=tech'
   *
   * // Example 3: appending a nested object
   * const url3 = URLHelper.appendQueryParams('https://api.example.com/resources', { filters: { category: 'news', status: 'published' } });
   * // Result: 'https://api.example.com/resources?filters[category]=news&filters[status]=published'
   *
   * // Example 4: No query parameters
   * const url4 = URLHelper.appendQueryParams('https://api.example.com/resources');
   * // Result: 'https://api.example.com/resources'
   * ```
   *
   * @remarks
   * - This method doesn't validate the URL format, please ensure the base URL is a valid string.
   *
   * @see {@link URLSearchParams}
   * @see {@link BaseQueryParams} for details on supported query parameter structures.
   *
   */
  static appendQueryParams(url: string, queryParams?: BaseQueryParams): string {
    if (!queryParams) {
      return url;
    }

    const params = new URLSearchParams();

    const appendParam = (key: string, value: unknown) => {
      // vals=[1, 2, 3] -> vals[0]='1', vals[1]='2', vals[3]='2'
      if (Array.isArray(value)) {
        value
          .filter((item) => typeof item !== 'undefined')
          .forEach((item, index) => params.append(`${key}[${index}]`, String(item)));
      }

      // vals={ foo: 'bar', bar: 40 } -> vals[foo]='bar', vals[bar]='40'
      else if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          appendParam(`${key}[${subKey}]`, subValue);
        }
      }

      // val=40 -> val='40'
      else if (typeof value !== 'undefined') {
        params.append(key, String(value));
      }
    };

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        appendParam(key, value);
      }
    }

    const queryString = params.toString();

    return queryString ? `${url}?${queryString}` : url;
  }
}
