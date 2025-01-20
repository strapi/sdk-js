import {
  HTTPAuthorizationError,
  HTTPBadRequestError,
  HTTPError,
  HTTPForbiddenError,
  HTTPInternalServerError,
  HTTPNotFoundError,
  HTTPTimeoutError,
} from '../../src';
import { StatusCode } from '../../src/http';

export const HTTP_ERROR_ASSOCIATIONS = [
  [{ status: StatusCode.BAD_REQUEST, statusText: 'Bad Request' }, HTTPBadRequestError],
  [{ status: StatusCode.UNAUTHORIZED, statusText: 'Unauthorized' }, HTTPAuthorizationError],
  [{ status: StatusCode.FORBIDDEN, statusText: 'Forbidden' }, HTTPForbiddenError],
  [{ status: StatusCode.NOT_FOUND, statusText: 'Not Found' }, HTTPNotFoundError],
  [{ status: StatusCode.TIMEOUT, statusText: 'Timeout' }, HTTPTimeoutError],
  [
    { status: StatusCode.INTERNAL_SERVER_ERROR, statusText: 'Internal Server Error' },
    HTTPInternalServerError,
  ],
  [{ status: 599, statusText: 'Unknown Error' }, HTTPError],
] as const;
