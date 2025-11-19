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
// GOOGLE ADS CAPI (Simples / Sem OAuth)
// POST /google-ads
// --------------------------------------------
app.post("/google-ads", async (req, res) => {
  try {
    console.log("Payload recebido do GTM (Google Ads):", req.body);

    const { gclid, email, phone, value = 0, currency = "BRL" } = req.body;

    const conversionId = process.env.GOOGLE_CONVERSION_ID;
    const conversionLabel = process.env.GOOGLE_CONVERSION_LABEL;

    if (!conversionId || !conversionLabel) {
      return res.status(400).json({ error: "Falta configurar GOOGLE_CONVERSION_ID ou GOOGLE_CONVERSION_LABEL" });
    }

    // URL oficial Google Ads Conversion Ping (Enhanced Conversions)
    const googleUrl = `https://www.google.com/pagead/conversion/${conversionId}/?label=${conversionLabel}&guid=ON&script=0`;

    const payload = new URLSearchParams({
      gclid: gclid || "",
      email: email || "",
      phone: phone || "",
      value: value,
      currency: currency
    });

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload
    });

    const textResponse = await response.text();
    console.log("Google Ads Response:", textResponse);

    return res.status(200).json({
      ok: true,
      google_resultado: textResponse
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
