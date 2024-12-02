import { URLParsingError, URLProtocolValidationError } from '../errors';

/**
 * Configuration settings for the URL validator.
 */
export interface URLValidatorConfig {
  /** An array of URL protocols that are considered valid */
  allowedProtocols: URLProtocol[];
}

/**
 * Represents a set of predefined URL protocols.
 *
 * This type encompasses a list of commonly used URL schemes, including:
 * - 'http:': Hypertext Transfer Protocol
 * - 'https:': Secure Hypertext Transfer Protocol
 * - 'ftp:': File Transfer Protocol
 * - 'ftps:': Secure File Transfer Protocol
 * - 'ws:': WebSocket Protocol
 * - 'wss:': Secure WebSocket Protocol
 * - 'sftp:': Secure File Transfer Protocol via SSH
 * - 'mailto:': Email Addressing
 * - 'file:': Local File Access
 * - 'data:': In-line Data
 * - 'git:': Git Version Control System
 * - 'ssh:': Secure Shell Protocol
 * - 'telnet:': Telnet Protocol
 * - 'ldap:': Lightweight Directory Access Protocol
 * - 'ldaps:': Secure LDAP
 * - 'scp:': Secure Copy Protocol
 * - 'gopher:': Gopher Protocol
 * - 'irc:': Internet Relay Chat
 */
export type URLProtocol =
  | 'http:'
  | 'https:'
  | 'ftp:'
  | 'ftps:'
  | 'ws:'
  | 'wss:'
  | 'sftp:'
  | 'mailto:'
  | 'file:'
  | 'data:'
  | 'git:'
  | 'ssh:'
  | 'telnet:'
  | 'ldap:'
  | 'ldaps:'
  | 'scp:'
  | 'gopher:'
  | 'irc:';

/**
 * Class representing a URLValidator.
 *
 * It provides the ability to validate URLs based on a predefined list of allowed protocols.
 */
export class URLValidator {
  private static readonly DEFAULT_CONFIG: URLValidatorConfig = {
    allowedProtocols: ['http:', 'https:'],
  };

  public readonly config: URLValidatorConfig;

  constructor(config: URLValidatorConfig = URLValidator.DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Validates the provided URL.
   *
   * This method checks that the provided URL is a string, can be parsed, and uses an allowed protocol.
   *
   * @param url - The URL to be validated. This parameter must be a valid string representation of a URL.
   *
   * @throws {URLParsingError} Thrown if the URL is not a string or can't be parsed.
   * @throws {URLProtocolValidationError} Thrown if the URL uses an unsupported protocol according to the validator's configuration.
   *
   * @example
   * // Example of validating a URL successfully
   * const validator = new URLValidator();
   *
   * const url = 'http://example.com';
   *
   * validator.validate(url); // Does not throw an error
   *
   * @example
   * // Example of a failing validation due to unsupported protocol
   * const validator = new URLValidator();
   *
   * const url = 'ftp://example.com';
   *
   * try {
   *   validator.validate(url);
   * } catch (error) {
   *   console.error(error); // URLProtocolValidationError
   * }
   */
  validate(url: unknown) {
    this.preValidation(url);

    const parsedURL = new URL(url);

    this.validateProtocol(parsedURL);
  }

  /**
   * Ensures the URL is a string and can be parsed.
   *
   * @param url - The URL to be validated.
   *
   * @throws {URLParsingError} Thrown if the URL is not a string or can't be parsed.
   */
  private preValidation(url: unknown): asserts url is string {
    if (typeof url !== 'string') {
      throw new URLParsingError(url);
    }

    const canParse = this.canParse(url);

    if (!canParse) {
      throw new URLParsingError(url);
    }
  }

  /**
   * Validates that the URL uses a protocol allowed by the configuration.
   *
   * @param url - A URL object representing the parsed URL.
   *
   * @throws {URLProtocolValidationError} Thrown if the URL's protocol is not in the allowed list.
   */
  private validateProtocol(url: URL) {
    const hasValidProtocol = this.hasValidProtocol(url);

    if (!hasValidProtocol) {
      throw new URLProtocolValidationError(url, this.config.allowedProtocols);
    }
  }

  /**
   * Checks if the URL string can be parsed.
   *
   * @param url - The URL string to be checked.
   *
   * @returns A boolean indicating whether the URL can be parsed.
   */
  private canParse(url: string): boolean {
    return URL.canParse(url);
  }

  /**
   * Checks if the protocol of the URL is valid based on the allowed protocols.
   *
   * @param url - A URL object.
   *
   * @returns A boolean indicating whether the protocol is in the allowed list.
   */
  private hasValidProtocol(url: URL): boolean {
    return this.config.allowedProtocols.includes(url.protocol as URLProtocol);
  }
}
