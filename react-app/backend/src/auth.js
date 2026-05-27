const crypto = require("crypto");

const AUTH_SECRET = process.env.AUTH_SECRET || "psicoagenda-dev-secret";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function signToken(payload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, receivedSignature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  if (receivedSignature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (_error) {
    return null;
  }
}

function buildAuthToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    exp: Date.now() + TOKEN_EXPIRY_SECONDS * 1000,
  };
  return signToken(payload);
}

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }
  return authorizationHeader.slice("Bearer ".length).trim();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Nao autorizado. Faça login novamente." });
  }

  req.authUser = {
    id: payload.sub,
    username: payload.username,
    name: payload.name,
  };
  return next();
}

module.exports = {
  hashPassword,
  buildAuthToken,
  verifyToken,
  getBearerToken,
  requireAuth,
};
