// Vitest global setup for the Tenali client.
//
// Registers the jest-dom matchers (toBeInTheDocument, toHaveTextContent, …)
// in their Vitest flavour so component tests can assert on the DOM the way
// Testing Library intends.
//
// Also clears jsdom's localStorage after every test. Several modules in this
// app cache state in localStorage (auth token, progress, …) and tests that
// seed a fake token must not leak it into the next test file.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  localStorage.clear();
});
