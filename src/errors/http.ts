export class HTTPError extends Error {
  public name = 'HTTPError';
  public response: Response;
  public request: Request;

  constructor(response: Response, request: Request) {
    const code: string = response.status?.toString() ?? '';
    const title = response.statusText ?? '';
    const status = `${code} ${title}`.trim();
    const reason = status ? `status code ${status}` : 'an unknown error';

    super(`Request failed with ${reason}: ${request.method} ${request.url}`);

    this.response = response;
    this.request = request;
  }
}

export class HTTPAuthorizationError extends HTTPError {
  public name = 'HTTPAuthorizationError';
}

export class HTTPNotFoundError extends HTTPError {
  public name = 'HTTPNotFoundError';
}

export class HTTPBadRequestError extends HTTPError {
  public name = 'HTTPBadRequestError';
}

export class HTTPInternalServerError extends HTTPError {
  public name = 'HTTPInternalServerError';
}

export class HTTPForbiddenError extends HTTPError {
  public name = 'HTTPForbiddenError';
}

export class HTTPTimeoutError extends HTTPError {
  public name = 'HTTPTimeoutError';
}
