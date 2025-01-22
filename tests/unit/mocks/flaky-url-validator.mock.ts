import { URLValidator } from '../../../src/validators';

/**
 * Class representing a FlakyURLValidator which extends URLValidator.
 *
 * This validator is designed to throw an error unexpectedly upon validation and should only be used in test suites.
 */
export class MockFlakyURLValidator extends URLValidator {
  validate() {
    throw new Error('Unexpected error');
  }
}
