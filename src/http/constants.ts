export enum StatusCode {
  /**
   * Standard response for successful HTTP requests.
   *
   * The actual response depends on the request method used.
   *
   * - In a GET request, the response contains an entity corresponding to the requested resource.
   * - In a POST request, the response contains an entity describing or containing the result of the action
   */
  OK = 200,

  /**
   * The request has been fulfilled, resulting in the creation of a new resource
   */
  CREATED = 201,

  /**
   * The server successfully processed the request and is not returning any content
   */
  NO_CONTENT = 204,

  /**
   * The server can't or won't process the request due to a client error.
   *
   * Possible reasons are:
   * - malformed request syntax
   * - size too large
   * - invalid request message framing
   * - deceptive request routing
   */
  BAD_REQUEST = 400,

  /**
   * Similar to 403 Forbidden, but specifically for use when authentication
   * is required and has failed or has not yet been provided.
   *
   * The '401' status semantically means "unauthenticated", the user doesn't
   * have valid authentication credentials for the target resource.
   */
  UNAUTHORIZED = 401,

  /**
   * The request contained valid data and was understood by the server, but the server is refusing action.
   *
   * This may be due to the user not having the necessary permissions for a resource or needing an account of some sort,
   * or attempting a prohibited action
   *
   * The request shouldn't be repeated.
   */
  FORBIDDEN = 403,

  /**
   * The requested resource couldn't be found but may be available in the future.
   *
   * Subsequent requests by the client are permissible.
   */
  NOT_FOUND = 404,

  /**
   * The server timed out waiting for the request.
   *
   * According to HTTP specifications:
   *
   * "The client didn't produce a request within the time that the server was prepared to wait.
   * The client MAY repeat the request without modifications at any later time."
   */
  TIMEOUT = 408,

  /**
   * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
   */
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Default timeout value in milliseconds for HTTP requests.
 *
 * It is set to 10.000 ms (10 seconds) and can be used as a baseline for setting request timeouts.
 */
export const DEFAULT_HTTP_TIMEOUT_MS = 10000;
