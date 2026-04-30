const express = require("express");

const router = express.Router();

router.get("/monthly-summary", (_req, res) => {
  return res.json({
    month: new Date().toISOString().slice(0, 7),
    expectedRevenue: 0,
    paidRevenue: 0,
    cancellationFees: 0,
    outstandingAmount: 0,
    note: "Endpoint inicial. Integrar com tabela de pagamentos na fase seguinte.",
  });
});

module.exports = router;
