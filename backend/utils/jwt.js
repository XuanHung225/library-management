const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// Simple in-memory blacklist for revoked tokens (suitable for small apps/testing).
// Note: this does not persist across restarts.
const blacklist = new Set();

exports.sign = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

exports.verify = (token) => {
  if (blacklist.has(token)) throw new Error("Token revoked");
  return jwt.verify(token, JWT_SECRET);
};

exports.decode = (token) => jwt.decode(token);

exports.revoke = (token) => {
  if (!token) return false;
  blacklist.add(token);
  return true;
};

exports.isRevoked = (token) => blacklist.has(token);
