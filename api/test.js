export default async function handler(req, res) {
  return res.json({ message: 'API working', nodeVersion: process.version });
}