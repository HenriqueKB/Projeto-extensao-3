const express = require("express");
const prisma = require("../prisma");
const {
  hashPassword,
  buildAuthToken,
  getBearerToken,
  verifyToken,
  requireAuth,
} = require("../auth");

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

router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Senha atual e nova senha sao obrigatorias." });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser.id },
    });

    if (!user || user.password !== hashPassword(currentPassword)) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword) },
    });

    return res.json({ ok: true, message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao alterar senha." });
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
