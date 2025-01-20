interface DocumentData {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface Meta {
  pagination?: Pagination;
}

interface GenericResponse<T> {
  data: T;
  meta: Meta;
}

export type GenericDocumentResponse = GenericResponse<DocumentData>;
export type GenericMultiDocumentResponse = GenericResponse<DocumentData[]>;

/**
 * Defines the structure of query parameters supported for Strapi content API requests.
 *
 * It provides options for filtering, sorting, pagination, localization, and population of related fields.
 *
 * @example
 * Fetching articles with filters, pagination, and specific fields.
 * ```typescript
 * const queryParams: baseQueryParams = {
 *   filters: { category: 'tech' }, // Filters articles by a 'tech' category
 *   fields: ['title', 'author'], // Fetches only 'title' and 'author' fields
 *   pagination: { page: 1, pageSize: 10 }, // Retrieves the first page with 10 items
 *   sort: ['publishedAt:desc'], // Sorts by 'publishedAt' field in descending order
 *   populate: { comments: true }, // Populates the 'comments' field with related data
 *   locale: 'en', // Fetches content available in English
 *   status: 'published' // Retrieves only published documents
 * };
 *
 * const articles = await collectionManager.find(queryParams);
 * ```
 *
 * @example
 * Appending query parameters to a URL
 * ```typescript
 * const url = 'https://api.example.com/articles';
 *
 * const params: BaseQueryParams = {
 *   filters: { isFeatured: true }, // Filters featured articles
 *   sort: 'title', // Sorts articles alphabetically by title
 * };
 *
 * const fullUrl = URLHelper.appendQueryParams(url, params);
 * // fullUrl: 'https://api.example.com/articles?filters[isFeatured]=true&sort=title'
 * ```
 *
 * @see {@link URLHelper.appendQueryParams} for how this type is serialized into query strings for API endpoints.
 */
export interface BaseQueryParams {
  /**
   * Specifies related fields or relations to return.
   *
   * Can be:
   * - a `string` to specify relation paths as `populate=name`
   * - an `array` of strings to specify multiple relation paths
   * - an `object` to enable deeper population configurations
   */
  populate?: string | string[] | Record<string, unknown>;

  /**
   * Specifies the fields of documents to include in the response.
   *
   * @note `documentId` and `id` fields are always present in a document, regardless of manually selected fields.
   */
  fields?: string[];

  /**
   * Applies filters to the records based on field values.
   */
  filters?: Record<string, unknown>;

  /**
   * Specifies the locale of the content to fetch.
   *
   * Relevant only for content types with i18n localization enabled.
   *
   * @example
   * // Retrieving content in German:
   * locale: 'de'
   */
  locale?: string;

  /**
   * Specifies the publication status of the content to fetch.
   * - `'draft'`: fetches only draft records.
   * - `'published'`: fetches only published records.
   */
  status?: 'draft' | 'published';

  /**
   * Sort the results based on a specific order.
   *
   * Can be
   * - a single string like `'field:asc'`
   * - an array of strings for multiple sorting criteria.
   */
  sort?: string | string[];

  /**
   * Configures pagination options for requests.
   *
   * Supports two combinations:
   * - `page` and `pageSize`: specify the pagination page and its size.
   * - `start` and `limit`: specify the starting index and the number of records to fetch.
   *
   * If `withCount` is set to true, include the total count of matched records in the response.
   */
  pagination?: {
    page?: number;
    pageSize?: number;
    withCount?: boolean;
    start?: number;
    limit?: number;
  };
}
