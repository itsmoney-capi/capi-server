import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Homepage
app.get("/", (req, res) => {
  res.send("CAPI Server funcionando 🚀");
});

// ----------------------
// META CAPI (POST /capi)
// ----------------------
app.post("/capi", async (req, res) => {
  try {
    console.log("Payload recebido do GTM (Meta):", req.body);

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );

    const result = await response.json();
    console.log("Meta Response:", result);

    return res.status(200).json({
      ok: true,
      meta_resultado: result
    });

  } catch (error) {
    console.error("Erro na Meta CAPI:", error);
    return res.status(500).json({ error: "Falha ao enviar para Meta" });
  }
});

// --------------------------------------------
// GOOGLE ADS CAPI (Enhanced Conversions) 
// POST /google-ads
// --------------------------------------------
app.post("/google-ads", async (req, res) => {
  try {
    console.log("Payload recebido do GTM (Google Ads):", req.body);

    const payload = req.body;

    const googlePayload = {
      conversion_action: process.env.GOOGLE_CONVERSION_ACTION,
      conversion_date_time: new Date().toISOString().replace("Z", "-03:00"),
      conversion_value: payload.value || 0,
      currency_code: "BRL",
      gclid: payload.gclid || null,
      wbraid: payload.wbraid || null,
      gbraid: payload.gbraid || null,
      user_identifiers: [
        payload.email ? { hashed_email: payload.email } : null,
        payload.phone ? { hashed_phone_number: payload.phone } : null
      ].filter(Boolean)
    };

    const response = await fetch(
      `https://googleads.googleapis.com/v13/customers/${process.env.GOOGLE_CUSTOMER_ID}:uploadClickConversions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          conversions: [googlePayload],
          partial_failure: false
        })
      }
    );

    const result = await response.json();
    console.log("Google Ads Response:", result);

    return res.status(200).json({
      ok: true,
      google_resultado: result
    });

  } catch (error) {
    console.error("Erro no Google Ads CAPI:", error);
    return res.status(500).json({ error: "Falha ao enviar para Google Ads" });
  }
});

// START
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});
