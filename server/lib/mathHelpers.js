/**
 * Math helper utilities for Tenali quiz generation
 */

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer in range [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Map number of digits to a numeric range for problem generation
 * Used for creating addition problems with appropriate difficulty
 * @param {number} digits - Number of digits (1, 2, or 3)
 * @returns {object} {min, max} range object
 */
function digitRange(digits) {
  if (digits === 1) return { min: 0, max: 9 };
  if (digits === 2) return { min: 10, max: 99 };
  if (digits === 3) return { min: 100, max: 999 };
  return { min: 1000, max: 9999 };
}

/**
 * gcd(a, b): Compute Greatest Common Divisor using the Euclidean algorithm.
 * Works with non-negative integers. Used to reduce fractions to lowest terms.
 *
 * @param {number} a - First non-negative integer
 * @param {number} b - Second non-negative integer
 * @returns {number} GCD of a and b
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * lcm(a, b): Compute Least Common Multiple.
 * Uses GCD.
 * @param {number} a
 * @param {number} b
 * @returns {number} LCM of a and b
 */
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * simplifyFraction(num, den): Reduce a fraction to lowest terms.
 * Ensures the denominator is always positive. Returns {num, den}.
 *
 * @param {number} num - Numerator (can be negative)
 * @param {number} den - Denominator (must be non-zero)
 * @returns {{num: number, den: number}} Simplified fraction
 */
function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

/**
 * Pick a random element from an array
 * @param {Array} arr - The array to pick from
 * @returns {*} A random element from the array
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  randomInt,
  digitRange,
  gcd,
  lcm,
  simplifyFraction,
  pick
};
