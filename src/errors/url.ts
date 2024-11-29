export class URLValidationError extends Error {}

export class URLParsingError extends URLValidationError {
  constructor(url: string) {
    super(`Could not parse invalid URL: "${url}"`);
  }
}

export class URLProtocolValidationError extends URLValidationError {
  constructor(url: URL | string, allowedProtocols: string[]) {
    const formattedProtocols = allowedProtocols.map((protocol) => `"${protocol}"`).join(', ');

    super(
      `Only ${formattedProtocols} protocols are supported, but got "${new URL(url).protocol}" instead.`
    );
  }
}
