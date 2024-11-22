import { add, div, mult, sub } from '../../src/math';

describe('Maths', () => {
  describe('div', () => {
    test('divides positive numbers correctly', () => {
      expect(div(10, 2)).toBe(5);
    });

    test('handles division by one', () => {
      expect(div(10, 1)).toBe(10);
    });

    test('returns zero when numerator is zero', () => {
      expect(div(0, 5)).toBe(0);
    });

    test('handles negative division correctly', () => {
      expect(div(-10, 2)).toBe(-5);
    });

    test('handles division by a negative number', () => {
      expect(div(10, -2)).toBe(-5);
    });

    test('handles division of negative numbers', () => {
      expect(div(-10, -2)).toBe(5);
    });

    test('returns Infinity for division by zero', () => {
      expect(div(10, 0)).toBe(Infinity);
    });
  });

  describe('mult', () => {
    test('multiplies positive numbers correctly', () => {
      expect(mult(10, 2)).toBe(20);
    });

    test('handles multiplication by one', () => {
      expect(mult(10, 1)).toBe(10);
    });

    test('returns zero when multiplied by zero', () => {
      expect(mult(0, 5)).toBe(0);
    });

    test('multiplies negative numbers correctly', () => {
      expect(mult(-10, -2)).toBe(20);
    });

    test('handles multiplication by a negative number', () => {
      expect(mult(10, -2)).toBe(-20);
    });
  });

  describe('sub', () => {
    test('subtracts positive numbers correctly', () => {
      expect(sub(10, 2)).toBe(8);
    });

    test('handles subtraction by one', () => {
      expect(sub(10, 1)).toBe(9);
    });

    test('returns the same number when subtracting zero', () => {
      expect(sub(5, 0)).toBe(5);
    });

    test('handles negative subtraction correctly', () => {
      expect(sub(-10, 2)).toBe(-12);
    });

    test('handles subtraction from a negative number', () => {
      expect(sub(10, -2)).toBe(12);
    });

    test('handles subtraction of two negative numbers', () => {
      expect(sub(-10, -2)).toBe(-8);
    });

    test('handles subtraction resulting in zero', () => {
      expect(sub(10, 10)).toBe(0);
    });
  });

  describe('add', () => {
    test('adds positive numbers correctly', () => {
      expect(add(10, 2)).toBe(12);
    });

    test('handles addition with zero', () => {
      expect(add(10, 0)).toBe(10);
    });

    test('adds negative numbers correctly', () => {
      expect(add(-10, -2)).toBe(-12);
    });

    test('adds a positive number and a negative number', () => {
      expect(add(10, -2)).toBe(8);
    });

    test('adds larger numbers correctly', () => {
      expect(add(1000000, 2000000)).toBe(3000000);
    });
  });
});
