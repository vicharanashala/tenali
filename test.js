/**
 * test.js — Vercel serverless function: health check endpoint
 *
 * GET /api/test
 * Returns a simple confirmation that the API is running, plus the
 * Node.js version string. Useful for verifying the function deploys
 * and responds correctly.
 */

export default async function handler(req, res) {
  return res.json({ message: 'API working', nodeVersion: process.version });
}