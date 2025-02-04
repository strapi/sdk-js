import createDebug from 'debug';
import qs from 'qs';

import type { BaseQueryParams } from '../types/content-api';

const debug = createDebug('strapi:utils:url-helper');

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
    debug('appending query params to %o: %o', url, queryParams);

    if (!queryParams) {
      debug('no query params provided, returning original URL: %o', url);
      return url;
    }

    const queryString = URLHelper.stringifyQueryParams(queryParams);

    if (!queryString) {
      debug('generated an empty query string, skipping...');
      return url;
    }

    // If a URL already contains a search query, use `&` instead of `?` to append the new search terms
    return URL.canParse(url) && new URL(url).search
      ? `${url}&${queryString}`
      : `${url}?${queryString}`;
  }

  /**
   * Converts an object of query parameters into a URL-encoded query string.
   *
   * Takes an object containing query parameters, transforms it into a properly formatted
   * query string, and returns the result.
   *
   * Uses the `qs` library for serialization, ensuring support for nested objects and arrays in query parameters.
   *
   * @param queryParams - An object containing key-value pairs to be serialized into a query string.
   *
   * @returns The serialized query string representing the provided query parameters.
   *
   * @example
   * ```typescript
   * // Example 1: simple key-value pair
   * const queryString1 = URLHelper.stringifyQueryParams({ locale: 'en' });
   * console.log(queryString1); // Output: 'locale=en'
   *
   * // Example 2: array as a parameter
   * const queryString2 = URLHelper.stringifyQueryParams({ tags: ['news', 'tech'] });
   * console.log(queryString2); // Output: 'tags[0]=news&tags[1]=tech'
   *
   * // Example 3: nested object
   * const queryString3 = URLHelper.stringifyQueryParams({ filters: { category: 'news', status: 'published' } });
   * console.log(queryString3); // Output: 'filters[category]=news&filters[status]=published'
   * ```
   *
   * @remarks
   * - This method relies on the `qs` library for query string serialization.
   * - The option `addQueryPrefix` is set to `false`, meaning the resulting string doesn't include leading `?`.
   *
   * @see
   * - {@link BaseQueryParams} for details on query parameter data structure.
   * - {@link https://github.com/ljharb/qs#stringifying qs.stringify documentation} for more about supported options and formats.
   *
   * @todo - replace usage of qs with a more lightweight version, the current one doubles the bundles size although we don't use much features
   */
  static stringifyQueryParams(queryParams: BaseQueryParams): string {
    return qs.stringify(queryParams, { addQueryPrefix: false, allowEmptyArrays: true });
  }

  /**
   * Converts a given string or URL instance into a human-readable URL path without query parameters.
   *
   * Normalizes to include only the origin and path while excluding any query strings or fragments.
   *
   * @param input - The input to be converted.
   *                Can be a string representing the URL or a URL object.
   *                If it is a string, it should be a valid absolute URL.
   *                If it is a `URL` instance, the method processes it directly.
   *
   * @returns A string representing the origin and path of the provided URL.
   *          Query parameters and fragments are removed.
   *
   * @example
   * // Using a string URL
   * const url = 'https://example.com/articles/1?param1=a&param2=b';
   * const readablePath = URLHelper.toReadablePath(url);
   * // 'https://example.com/articles/1'
   *
   * @example
   * // Using a URL instance
   * const url = new URL('https://example.com/articles/1?param1=a&param2=b');
   * const readablePath = URLHelper.toReadablePath(url);
   * // 'https://example.com/articles/1'
   */
  public static toReadablePath(input: string | URL) {
    const url = input instanceof URL ? input : new URL(input);

    return `${url.origin}${url.pathname}`;
  }
}
