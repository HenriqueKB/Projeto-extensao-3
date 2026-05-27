const express = require("express");
const prisma = require("../prisma");
const { hashPassword, buildAuthToken, getBearerToken, verifyToken } = require("../auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario e senha sao obrigatorios." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: String(username).trim() },
    });

    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: "Credenciais invalidas." });
    }

    const token = buildAuthToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao realizar login." });
  }
});

router.get("/me", (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Sessao invalida ou expirada." });
  }

  return res.json({
    user: {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
    },
  });
});

module.exports = router;
