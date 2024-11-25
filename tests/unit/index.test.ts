import { greetings } from '../../src';

describe('greetings function', () => {
  it('should return "Hello World!"', () => {
    expect(greetings()).toBe('Hello World!');
  });
});
